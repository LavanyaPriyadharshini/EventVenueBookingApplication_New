import { rateLimit } from 'express-rate-limit'; //checks and enforces the request limit
import { RedisStore } from 'rate-limit-redis'; //Stores rate-limit counters in Redis
import Redis from 'ioredis'; //Connects to Redis and executes Redis commands

// Think of it this way: express-rate-limit decides whether to allow a request, 
// RedisStore handles rate-limit storage, and ioredis communicates with
//  the Redis server.

// A single shared Redis client, reused by every limiter this process creates — not one
// connection per limiter. - this redis is running in the docker container
const redisClient = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');

// In-memory rate limiting only tracks counts within one process — wrong the moment you run more
// than one instance (each would have its own independent counter). Backing it with Redis makes
// the limit correct and shared across every instance of a service, or even across services.
export const createRateLimiter = (windowMs: number, limit: number) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: true,
    legacyHeaders: false,

    //this store connects the rate-limiting library to your Redis client
    store: new RedisStore({
      // ioredis's .call() requires a real first argument, not a spread of an array it can't
      // prove is non-empty — destructuring the command off first satisfies that exactly.
      sendCommand: (...args: string[]) => {
        const [command, ...rest] = args;
        return redisClient.call(command, ...rest) as any;
      },
    }),
  });


  //explanation of CreateRateLimiter 
  //1. it is a factory function - it creates and returns an object or configured component
  //here, it creates and returns an Express rate-limiting middleware
  //ex- somewhere in the application we could write  like
//   const apiLimiter = createRateLimiter(
//   15 * 60 * 1000,
//   100
// );


// This means:

// windowMs: defines the rate limiting time window-15 minutes, expressed in milliseconds.

// limit: specifies the max number of requests allowed within the window for each rate limit key
// - 100 requests per window for the rate-limit key used by the middleware.

// apiLimiter: the middleware returned by rateLimit().

//eg - createRateLimiter(60000, 10);
//this configures a limit of 10 requests per one minute window


//-------this creates a store adapter that allows express-rate-limit to save and retrieve its rate-limit information using Redis.
//In other words, the limiter delegates its storage operations to Redis rather than keeping its counters only in local application memory.
//new RediStore({
// sendCommand: ...
//})
