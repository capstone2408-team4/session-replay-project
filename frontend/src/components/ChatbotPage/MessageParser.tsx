import React from 'react';


const MessageParser = ({ children, actions }) => {
  const FIVE_SECONDS = 5000;
  const REGEX = /([a-zA-Z])\1{3}/;
  
  const [lastMessageTime, setLastMessageTime] = React.useState(Date.now());
  
  const parse = async (message) => { 
    const messageTime = Date.now()
    console.log('parsing', messageTime - lastMessageTime);
    if (message.length < 15) {
      actions.handleShortMessage()
    } else if ((messageTime - lastMessageTime) < FIVE_SECONDS) {
      actions.handleDebounce()
      return
    } else if (message.length > 100) {
      actions.handleLongMessage()
    } else if (REGEX.test(message)) {
      actions.handleNonsense()
    } else {
      actions.handleValidQuery()
    }

    setLastMessageTime(Date.now())
  };

  return (
    <div>
      {React.Children.map(children, (child) => {
        return React.cloneElement(child, {
          parse: parse,
          actions: {},
        });
      })}
    </div>
  );
};

export default MessageParser;