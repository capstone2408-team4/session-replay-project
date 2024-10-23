import React from "react";
import rrwebPlayer from "rrweb-player";
import styles from './Player.module.css'
import { Session } from "../../Types";

interface PlayerProps {
  session: Session | string
}

const Player = ({ session }: PlayerProps) => {
  React.useEffect(() => {
    console.log('player effect hook')
    const playerRoot = document.getElementById("replayer");
    let playerInstance;
    const initializeWebPlayer = function() {
      if (playerRoot !== null && session) {
        try {
          playerInstance = new rrwebPlayer({
            target: playerRoot,
            props: {
              events: session,
              mouseTail: {
                strokeStyle: "#ff842d",
              },
            },
          });
        } catch (error) {
          console.log('Error initializing web player:', error);
        }
      } else {
        console.log('Web player root not found. Unable to load player');
      }
    }

    initializeWebPlayer();

    return(() => {
      if (playerInstance) {
        playerInstance.pause();
        playerInstance = null;
      }
      playerRoot.innerHTML = '';
    })

  }, [session]);

  return <div id="replayer" className={styles.replayContainer}></div>;
};

export default Player;