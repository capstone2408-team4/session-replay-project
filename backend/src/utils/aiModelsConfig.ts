export const OpenAIMaxTokens = 100_000;
export const OpenAICharsPerToken = 4;
export const OpenAIMaxPromptLength = OpenAIMaxTokens * OpenAICharsPerToken;
export const OpenAIModel = 'gpt-4o-mini';
export const EmbeddingDimensions = 1536;
export const EmbeddingModel = 'text-embedding-3-small'
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
Did the user leave the site wit items left in cart?
Can you surmise why if they did?
`

export const MultiSessionSummaryPrompt = `
Interperet this group of session summaries. Consider if there are trends in how users are interacting with the application. Are there any outliers? If there is a trend, explain that, if there are outliers explain those. Make sure your answer is rooted in these summaries.
`

export const TestSummary4Embed = "The session replay analysis indicates a predominantly positive user experience during the checkout process of the application. The user engaged extensively with features such as adding products to the cart, filling out checkout fields, and ultimately placing their order successfully. The appearance of an 'Order placed successfully!' message and a confirmation toast suggests that the transactional flow is functioning as intended, providing users with positive feedback and a sense of accomplishment. However, some navigational behavior, characterized by rapid movements on the screen, may signify underlying impatience or a need for more efficient browsing, although this did not culminate in frustration or errors during the session. The user’s interactions reflect typical online shopping behavior, including effective utilization of filtering options and confirmation of product availability, all without encountering significant hurdles. In summary, while the user displayed some signs of impatience during their exploration, their overall experience remained positive and indicative of effective app functionality in facilitating the shopping process. No critical errors were noted, reinforcing the app’s strengths in delivering a satisfying e-commerce experience."