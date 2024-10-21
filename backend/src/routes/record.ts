import express from 'express';
import { RedisService } from '../services/redisService';
import { PsqlService } from '../services/psqlService';
const router = express.Router();

const redis = new RedisService();
const psql = new PsqlService();

router.post('/record', async (req, res) => {
  const { projectID, sessionID, timestamp, events } = req.body;
  const serverTimestamp = new Date().toISOString(); // UTC

  try {
    // Check for valid project in PSQL
    const projectMetadata = await psql.getProject(projectID);

    if (!projectMetadata) {
      // Reject the request >> 404?
      return res.status(400).json({ error: 'Invalid project' });
    }

    // Check for session metadata in PSQL
    const sessionMetadata = await psql.getSession(sessionID);
    
    if (!sessionMetadata) {
      await psql.addSession(sessionID, projectID, serverTimestamp);
    } else {
      await psql.updateSessionActivity(sessionID, serverTimestamp); // need some slightly more complex logic on this method
    }

    // Add session event data to Redis
    await redis.addRecording(sessionID, JSON.stringify(events));

    res.status(200).json({ message: 'Events batch processed successfully' });
  } catch (error) {
    console.error('Error processing batch:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

//   // if session doesn't exist (not in progress)
//   if (!redis.sessionExists(sessionID)) {
//     psql.addSession(projectID, sessionID, timestamp);
//   } 

//   redis.addRecording(sessionID, events)
//   // set expiry -- 

// })

// app.ts --> routes -->  controllers --> services


//
// CREATE TABLE sessions (
//   id SERIAL PRIMARY KEY,
//   project_id INTEGER NOT NULL,
//   session_id VARCHAR(255),
//   events_file_name VARCHAR (255) NOT NULL,
//   session_summary VARCHAR (5000),                           
//   session_start TIMESTAMP NOT NULL,
//   session_end TIMESTAMP,
//   CONSTRAINT fk_project FOREIGN KEY (project_id) REFERENCES projects(id)
// );
//  CREATE TABLE projects (
//    id SERIAL PRIMARY KEY, 
//    name VARCHAR(255) NOT NULL,
//    password_hash VARCHAR(255)
// );

// CREATE DATABASE heimdall

// id                                        |              project_id              |                    file_name                    | session_summary |       session_start        |        session_end         |      last_activity_at      | is_active 
// --------------------------------------+--------------------------------------+-------------------------------------------------+-----------------+----------------------------+----------------------------+----------------------------+-----------
// 1 // 217e3db2-029a-49b6-a69c-e242aa48f401 | cfc15e83-970b-42cd-989f-b87b785a1fd4 | 217e3db2-029a-49b6-a69c-e242aa48f401-events.txt |                 | 2024-10-21 03:30:36.981+00 | 2024-10-21 03:51:59.395+00 | 2024-10-21 04:02:16.952+00 | t
// 2 // bf71169b-1ab4-47db-903c-fdb72698e4a0 | cfc15e83-970b-42cd-989f-b87b785a1fd4 | bf71169b-1ab4-47db-903c-fdb72698e4a0-events.txt |                 | 2024-10-21 04:02:36.167+00 | 2024-10-21 04:13:15.529+00 | 2024-10-21 04:26:11.179+00 | t
// 3 // bf71169b-1ab4-47db-903c-fdb72698e4a0 | cfc15e83-970b-42cd-989f-b87b785a1fd4 | bf71169b-1ab4-47db-903c-fdb72698e4a0-events.txt |                 | 2024-10-21 04:02:36.167+00 | 2024-10-21 04:13:15.529+00 | 2024-10-21 04:26:11.179+00 | t



