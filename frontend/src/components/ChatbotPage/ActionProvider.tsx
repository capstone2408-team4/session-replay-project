// @ts-nocheck
// types not provided as part of npm package
import React from 'react';
import axios from 'axios';


const ActionProvider = ({ createChatBotMessage, setState, children }) => {
  const handleShortMessage = () => {
    const botMessage = createChatBotMessage('My apologies! I can only respond to messages longer than 15 characters. ');

    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, botMessage],
    }));
  };

  const handleDebounce = () => {
    const botMessage = createChatBotMessage('My apologies! I can only respond to messages once every 5 seconds.');

    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, botMessage],
    }));
  }

  const handleLongMessage = () => {
    const botMessage = createChatBotMessage('My apologies! I can only respond to messages less than 100 characters long.');

    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, botMessage],
    }));
  }

  const handleNonsense = () => {
    const botMessage = createChatBotMessage('Please enter a valid query.');

    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, botMessage],
    }));
  }

  const handleValidQuery = async function(message: string) {
    try {
      const response = await axios.post('/api/chatbot-query', { query: message }, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      
      const botMessage = createChatBotMessage(response.data);
      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, botMessage],
      }));
    } catch (error) {
      const botMessage = createChatBotMessage('Sorry, something went wrong. Please try again later.');

      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, botMessage],
      }));
      console.error('Error retrieving response from OpenAI.', error)
      throw error
    }
  }

  return (
    <div>
      {React.Children.map(children, (child) => {
        return React.cloneElement(child, {
          actions: {
            handleShortMessage,
            handleDebounce,
            handleLongMessage,
            handleNonsense,
            handleValidQuery
          },
        });
      })}
    </div>
  );
};

export default ActionProvider;