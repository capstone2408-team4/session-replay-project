import * as AIConfig from '../utils/aiModelsConfig';

abstract class AIParent {
  protected abstract maxPromptLength: number;

  // Splits data into manageable chunks of data to feed into the AI model
  // Each model will have a different max prompt length as seen on line 4.
  // protected splitIntoChunks(data: string): string[] {
  //   const chunks: string[] = [];
  //   let startIndex = 0;

  //   while (startIndex < data.length) {
  //     chunks.push(data.slice(startIndex, startIndex + this.maxPromptLength));
  //     startIndex += this.maxPromptLength;
  //   }

  //   return chunks;
  // }

  protected splitIntoChunks(data: string): string[] {
    const chunks: string[] = [];
    let startIndex = 0;

    while (startIndex < data.length) {
      // Find the next chunk ending point without breaking JSON events
      let endIndex = startIndex + this.maxPromptLength;
      
      // If the end index goes beyond the data length, set it to the data length
      if (endIndex >= data.length) {
        chunks.push(data.slice(startIndex));
        break;
      }

      // Move the end index backwards to a point that keeps JSON structure intact
      const lastComma = data.lastIndexOf('},{', endIndex);
      const lastBrace = data.lastIndexOf('}{', endIndex);

      // Choose the latest natural breakpoint
      const breakpoint = Math.max(lastComma, lastBrace);

      // If a breakpoint is found within bounds, adjust endIndex to it
      if (breakpoint > startIndex) {
        endIndex = breakpoint + 1; // Include the comma or brace in the chunk
      }

      chunks.push(data.slice(startIndex, endIndex));
      startIndex = endIndex;
    }

    return chunks;
  }  

  // Feeds session data into the instation of a specific AI model. Handles if
  // there is more than one chunk of data.
  async summarizeSession(data: string): Promise<string> {
    const chunks = this.splitIntoChunks(data);
    let summaries = await this.summarizeSessionChunks(chunks);

    if (summaries.length > 1) {
      const summary = summaries.join(' ');
      console.log('summarizing a whole sessions');
      return await this.query(AIConfig.SessionSummariesPrompt, summary);
    } else {
      return summaries[0];
    }
  }

  protected abstract query(prompt: string, data: string): Promise<string>;

  // This is needed to speed up the queries to the AI model via Promise.allSettled
  private async summarizeSessionChunks(chunks: string[]): Promise<string[]> {
    console.log('summarizing a chunk')
    const promises = chunks.map(chunk => this.query(AIConfig.SessionChunkPrompt, chunk));
    const summaries = await Promise.allSettled(promises);

    return summaries.map(summary => summary.value);
  } 
}

export default AIParent;