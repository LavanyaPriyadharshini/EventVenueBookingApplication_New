import 'dotenv/config';
import cluster from 'node:cluster'; //creates and manages multiple node .js processes
import os from 'node:os'; //Provides operating system information, including CPU cores.
import { app } from './app';
import { connectDB } from './config/db';

// One Node process only ever uses one CPU core for JS execution — bcrypt hashing on one
// request blocks every other request on that same process while it runs. Forking one worker
// per core lets the OS/cluster module spread incoming connections across cores instead.
const numCPUs = os.cpus().length;


//The primary process manages the workers. It does not directly 
// serve HTTP requests through the app.listen() code in your example.
if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} starting ${numCPUs} workers`);

  for (let i = 0; i < numCPUs; i++) cluster.fork();

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} exited (${signal || code}) — restarting`);
    cluster.fork();//creates a new worker process that runs the same entry point file
    //The cluster.isPrimary condition ensures that the primary creates workers while the workers execute the else block.
  });
}

//connect to the database in each worker
else {
  connectDB().then(() => {
    app.listen(process.env.PORT, () =>
      console.log(`auth-service worker ${process.pid} on ${process.env.PORT}`)
    );
  });
}



//this file is used to run multiple node.js worker processes so the application can handle more requests
//by using multiple CPU cores
//this is mentioned in the auth-service - helps authentication api handle multiple requests such as user registration and login
// 1. Why do we need cluster.ts?
//By default, one Node.js process executes JavaScript on a single main thread.
//If your server has 8 CPU cores, a single Node.js process does not automatically use all 8 cores for JavaScript execution.

//refer notes "Cluster.md"