import { createChatBotMessage } from 'react-chatbot-kit';

const config = {
  initialMessages: [createChatBotMessage(`Welcome to Providence. I am Providence Bot, how may I help you?`, {})],
  botName: 'Providence',
};

export default config;