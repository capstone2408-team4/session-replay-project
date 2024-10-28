export const OpenAIMaxTokens = 100000;
export const OpenAICharsPerToken = 4;
export const OpenAIMaxPromptLength = OpenAIMaxTokens * OpenAICharsPerToken;
export const OpenAIModel = 'gpt-4o-mini';
// export const SessionSummariesPrompt = 'Summarize the following rrweb summaries into one main summary';
// export const SessionChunkPrompt = 'Summarize the following rrweb events into one short paragraph';

export const SessionSummariesPrompt = 'Keep the same format of these summaries in your response and derive only the 3 most important bullet points for each category. Tailor the response to a product manager or UX design manager looking for insights on their product. Also please include a behavior sentiment score from 1-10. Where 1 is the worst imaginable experience and 10 being the best imaginable.'
export const SessionChunkPrompt = 'Summarize the following rrweb data into bullet points of categories: sucessful achievements, user frustration, and key takeways. Provide only the most pertinent insights and 3 bullet points maximum per category. If you do not think there is any data to support a bullet point, dont do arbitrarily create one. Tailor the response to a product manager or UX design manager looking for insights on their product.'
