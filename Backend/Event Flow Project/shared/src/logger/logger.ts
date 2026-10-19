import winston from 'winston';

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [new winston.transports.Console()],
});


// Logging means recording information about what happens inside your 
// application, such as requests, errors, database failures, and important business operations.

// /Winston is a logging library for Node.js. It provides methods to record 
// messages with different severity levels and supports multiple output destinations.

//logger.info('User registered successfully');
// logger.warn('Login attempt failed');
// logger.error('Database connection failed');

