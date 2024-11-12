import React from "react";
import rrwebPlayer from "rrweb-player";
import styles from './Player.module.css'
import type { eventWithTime } from "@rrweb/types";
import logger from "../../utils/logger";

interface PlayerProps {
  session: eventWithTime[]
}

const Player = ({ session }: PlayerProps) => {
  React.useEffect(() => {
    const playerRoot = document.getElementById("replayer");
    let playerInstance: rrwebPlayer | null = null;

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
            },
          });
        } catch (error) {
          logger.error('Error intializing rrweb player instance.', {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            timestamp: new Date().toISOString()
          })
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