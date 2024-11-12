import { createLogger, format, transports } from 'winston';

const logger = createLogger({
 level: process.env.NODE_ENV === 'production' ? 'error' : 'debug',
 format: format.combine(
   format.timestamp(),
   format.json()
 ),
 transports: [
   // Console transport
   new transports.Console({
     format: format.combine(
       format.colorize(),
       format.simple()
     )
   }),
 ]
});

export default logger;