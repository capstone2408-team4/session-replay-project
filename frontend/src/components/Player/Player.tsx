import React from "react";
import rrwebPlayer from "rrweb-player";
import styles from './Player.module.css'
// import { getReplayConsolePlugin } from '@rrweb/rrweb-plugin-console-replay';

interface PlayerProps {
  session: any[]
}

const Player = ({ session }: PlayerProps) => {
  React.useEffect(() => {
    const playerRoot = document.getElementById("replayer");
    let playerInstance: any;

    const initializeWebPlayer = function() {
      if (playerRoot !== null && session.length > 1) {
        try {
          playerInstance = new rrwebPlayer({
            target: playerRoot,
            props: {
              events: session,
              autoPlay: false,
              mouseTail: {
                strokeStyle: "#ff842d",
              },
              // plugins: [
              //   getReplayConsolePlugin({
              //     level: ['info', 'log', 'warn', 'error'],
              //   }),
              // ], 
            },
          });
        } catch (error) {
          console.log('Error initializing web player:', error);
        }
      }
    }

    initializeWebPlayer();

    return(() => {
      if (playerInstance) {
        playerInstance.pause();
        playerInstance = null;
      }
      if (playerRoot) {
        playerRoot.innerHTML = '';
      }
    })

  }, [session]);

  return <div id="replayer" className={styles.replayContainer}></div>;
};

export default Player;