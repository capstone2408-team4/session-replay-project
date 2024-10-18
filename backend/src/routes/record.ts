import express from 'express';
import { RedisService } from '../services/redisService';
import { PsqlService } from '../services/psqlService';
const router = express.Router();

const redis = new RedisService();
const psql = new PsqlService();

router.post('/record', (req, res) => {
  const { projectID, sessionID, timestamp, events } = req.body;

  // if session doesn't exist (not in progress)
  if (!redis.sessionExists(sessionID)) {
    psql.addSession(projectID, sessionID, timestamp);
  } 

  redis.addRecording(sessionID, events)
  // set expiry -- 

})

// app.ts --> routes -->  controllers --> services

//
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