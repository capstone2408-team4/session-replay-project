import * as AIConfig from '../utils/aiModelsConfig.js';
import { ProcessedSession } from '../preprocessor/types.js';

interface Summary {
  session_summary: string;
  status: string;
  value: string;

}

abstract class AIParent {
  protected abstract maxPromptLength: number;
  protected abstract query(systemPrompt: any, userPrompt: any, data: string): Promise<string>;

  protected splitIntoChunks(data: ProcessedSession): any[] {
    // Create base context that is shared across all chunks
    const baseContext = {
      metadata: data.metadata,
      events: {
        total: data.events.total,
        byType: data.events.byType,
        bySource: data.events.bySource,
        significant: data.events.significant
      },
      technical: data.technical,
      dom: {
        fullSnapshot: data.dom.fullSnapshot,
        incrementalSnapshots: [] // Will contain subset of incremental snapshots
      }
    };

    // Get size of base context to know how much room we have for snapshots
    const baseContextSize = JSON.stringify(baseContext).length;
    const availableSpace = this.maxPromptLength - baseContextSize;

    // Chunk the incremental snapshots while maintaining full context
    const chunks: any[] = [];
    let currentSnapshots: any[] = [];
    let currentSize = 0;

    data.dom.incrementalSnapshots.forEach((snapshot, index) => {
      const snapshotSize = JSON.stringify(snapshot).length;

      if (currentSize + snapshotSize > availableSpace) {
        // Create chunk with full context + current group of snapshots
        const chunk = {
          ...baseContext,
          dom: {
            ...baseContext.dom,
            incrementalSnapshots: currentSnapshots,
            // Add metadata specifically about the chunking
            incrementalSnapshotRange: {
              start: currentSnapshots[0].timestamp,
              end: currentSnapshots[currentSnapshots.length - 1].timestamp,
              chunkNumber: chunks.length + 1
            }
          }
        };
        chunks.push(chunk);

        // Reset for next chunk
        currentSnapshots = [snapshot];
        currentSize = snapshotSize;
      } else { // including current incrementalSnapshot will not bring the current chunk size over the remaining available space
        currentSnapshots.push(snapshot);
        currentSize += snapshotSize;
      }
    });
    return chunks;
  }

  // Feeds session data into the instation of a specific AI model. Handles if
  // there is more than one chunk of data.
  async summarizeSession(data: ProcessedSession): Promise<string> {
    const totalSize = JSON.stringify(data).length;
    console.log('**TOTAL SESSION LENGTH PRE-CHUNKING**:', totalSize);

    // First determine if chunking is needed
    if (totalSize < this.maxPromptLength) {
      console.log('**NO CHUNKING**');
      return await this.query(
        AIConfig.SessionSystemPrompt,
        AIConfig.SessionUserPrompt,
        JSON.stringify(data));
    }

    // Chunking is needed
    console.log('**CHUNKING**');
    const chunks = this.splitIntoChunks(data);

    // Get summaries for each chunk
    const chunkSummaries = await this.summarizeSessionChunks(chunks);

    // Create context for final summary
    const finalContext = {
      sessionMeta: chunks[0].metadata,
      numberOfChunks: chunks.length,
      chunkSummaries: chunkSummaries.map((summary, index) => ({
        chunkNumber: index + 1,
        timeRange: chunks[index].dom.incrementalSnapshotRange,
        summary: summary
      }))
    };

    // Get final cohesive summary
    return await this.query(
      AIConfig.FinalSummarySystemPrompt,
      AIConfig.FinalSummaryUserPrompt,
      JSON.stringify(finalContext)
    );
  }

  // This is needed to speed up the queries to the AI model via Promise.allSettled
  private async summarizeSessionChunks(chunks: any[]): Promise<string[]> {
    const summaryPromises = chunks.map((chunk, index) => {
      const timeRange = chunk.dom.incrementalSnapshotRange;

      let chunkUserPrompt = AIConfig.SessionChunkUserPrompt;
      if (index > 0) {
        chunkUserPrompt.content += `\n\nThis chunk covers DOM changes from ${timeRange.start} to ${timeRange.end}. This is part ${timeRange.chunkNumber} of ${chunks.length} for the session.\n\nChunk:`;
      }

      return this.query(AIConfig.SessionChunkSystemPrompt, chunkUserPrompt, JSON.stringify(chunk));
    });

    const summaries = await Promise.allSettled(summaryPromises);

    return summaries
      .map(summary => summary.status === 'fulfilled' ? summary.value : '')
      .filter(Boolean);
  }

  async summarizeMultipleSessions(summaries: Summary[]): Promise<string> {
    let selectedSummaries = '';

    for (const { session_summary } of summaries) {
      selectedSummaries += `---SUMMARY START---\n${session_summary}\n---SUMMARY END---\n`;
    }

    return await this.query(
      AIConfig.MultiSessionSystemPrompt,
      AIConfig.MultiSessionUserPrompt,
      selectedSummaries);
  }
}

export default AIParent;