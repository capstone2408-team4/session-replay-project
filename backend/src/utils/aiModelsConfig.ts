export const OpenAIMaxTokens = 100_000;
export const OpenAICharsPerToken = 4;
export const OpenAIMaxPromptLength = OpenAIMaxTokens * OpenAICharsPerToken;
export const OpenAIModel = 'gpt-4o-mini';
// export const SessionSummariesPrompt = 'Summarize the following rrweb summaries into one main summary';
// export const SessionChunkPrompt = 'Summarize the following rrweb events into one short paragraph';

export const SessionSummariesPrompt = `
Keep the same format of these summaries in your response and derive only the 3
most important bullet points for each category. Tailor the response to a product
manager or UX design manager looking for insights on their product. Also please
include a behavior sentiment score from 1-10. Where 1 is the worst imaginable
experience and 10 being the best imaginable.`

export const SessionChunkPrompt = `
Here are some rrweb events. 
Can you summarize what the user did? Please dont give me any extraneous explanations about rrweb. Just tell me what the user did.`

export const MultiSessionSummaryPrompt = `
Interperet this group of session summaries. Consider if there are trends in how users are interacting with the application. Are there any outliers? If there is a trend, explain that, if there are outliers explain those. Make sure your answer is rooted in these summaries.
`