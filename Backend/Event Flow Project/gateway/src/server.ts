import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

//forwards incoming requests to other servers
import { createProxyMiddleware } from 'http-proxy-middleware';
import 'dotenv/config';

const app = express();
app.use(cors());
app.use(helmet());

// Add an entry here as each service comes online.
//you have to add the service entries what ever serives endpoints we use, we have to metion it here
const routes: Record<string, string | undefined> = {
  '/api/auth': process.env.AUTH_SERVICE_URL,
  '/api/venues': process.env.VENUE_SERVICE_URL,
};


//iterating over the route configuration
//object.entries -> this converts the object into key-value pairs
for (const [path, target] of Object.entries(routes)) {
  if (!target) continue; //checks whether the service url exists
  app.use(path, 
    
    //this creates the proxy middleware
    //target - specifies the destination server
    //change origin- true changes the outgoing request's host header to match the target url.
    createProxyMiddleware({ target, changeOrigin: true }));
}

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Gateway on ${port}`));



// The gateway does not need to implement the registration business logic itself. 
// It forwards the request to the service that owns that functionality.

//for (const [path, target]  -> uses array destructuring to extract each pair


//eg - object.entries
// const routes = {
//   '/api/auth': 'http://localhost:5001',
//   '/api/events': 'http://localhost:5002'
// };

// object.entries(routes) produces
// [
//   ['/api/auth', 'http://localhost:5001'],
//   ['/api/events', 'http://localhost:5002']
// ]

//for the first iteration the path will be 
//path = '/api/auth';
//target = 'http://localhost:5001';

//second iteration will be like
//path = '/api/events';
//target = 'http://localhost:5002';

// /This way, one loop can configure multiple services.