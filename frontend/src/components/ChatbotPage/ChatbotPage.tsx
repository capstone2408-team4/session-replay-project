import Header from "../Header";
import styles from "./ChatbotPage.module.css"
import Chatbot from 'react-chatbot-kit'
import config from './config.ts';
import MessageParser from './MessageParser.tsx'
import ActionProvider from './ActionProvider.tsx'

function ChatbotPage() {
  return (
    <div className={styles.mainPageWrapper}>
      <div className={styles.headerContainer}>
        <Header selectedPage={'chatbot'} project='Providence'/>
      </div>
      <div className={styles.chatbotContainer}>
        <Chatbot 
          config={config}
          messageParser={MessageParser}
          actionProvider={ActionProvider}
        />
      </div>
    </div>
  );
}

export default ChatbotPage;
