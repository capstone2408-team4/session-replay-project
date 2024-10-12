import * as AIConfig from '../utils/aiModelsConfig';

abstract class AIParent {
  protected abstract maxPromptLength: number;

  // Splits data into manageable chunks of data to feed into the AI model
  // Each model will have a different max prompt length as seen on line 4.
  protected splitIntoChunks(data: string): string[] {
    const chunks: string[] = [];
    let startIndex = 0;

    while (startIndex < data.length) {
      chunks.push(data.slice(startIndex, startIndex + this.maxPromptLength));
      startIndex += this.maxPromptLength;
    }

    return chunks;
  }

  // Feeds session data into the instation of a specific AI model. Handles if
  // there is more than one chunk of data.
  async summarizeSession(data: string): Promise<string> {
    const chunks = this.splitIntoChunks(data);
    let summaries = await this.summarizeSessionChunks(chunks);

    if (summaries.length > 1) {
      summaries = summaries.join(' ');
      return await this.query(AIConfig.SessionSummariesPrompt, summaries);
    } else {
      return summaries[0];
    }
  }

  protected abstract query(prompt: string, data: string): Promise<string>;

  // This is needed to speed up the queries to the AI model via Promise.allSettled
  private async summarizeSessionChunks(chunks: string[]): Promise<string[]> {
    const promises = chunks.map(chunk => this.query(AIConfig.SessionChunkPrompt, chunk));
    const summaries = await Promise.allSettled(promises);

    return summaries.map(summary => summary.value);
  } 
}

export default AIParent;