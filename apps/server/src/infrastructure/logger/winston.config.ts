import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';

const errorTransport = new winston.transports.DailyRotateFile({
  dirname: 'logs',
  filename: 'error-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  level: 'error',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
});
// Set max listeners to high number to avoid warnings for transient logger instances
errorTransport.setMaxListeners(100);

const combinedTransport = new winston.transports.DailyRotateFile({
  dirname: 'logs',
  filename: 'combined-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
});
combinedTransport.setMaxListeners(100);

const consoleTransport = new winston.transports.Console({
  level: 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.ms(),
    nestWinstonModuleUtilities.format.nestLike('HiveK', {
      colors: true,
      prettyPrint: true,
    }),
  ),
});
consoleTransport.setMaxListeners(100);

export const winstonConfig = {
  transports: [
    consoleTransport,
    errorTransport,
    combinedTransport,
  ],
};
