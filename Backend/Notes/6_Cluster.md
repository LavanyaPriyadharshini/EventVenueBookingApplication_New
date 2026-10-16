1. Why do we need cluster.ts?

By default, one Node.js process executes JavaScript on a single main thread
If your server has 8 CPU cores, a single Node.js process does not automatically use all 8 cores for JavaScript execution.

Imagine 100 users trying to log in simultaneously.

Your login API performs password verification using bcrypt, which is CPU-intensive.

Without Cluster
---------------------
Node.js Process — Worker 1 - Handles JavaScript on one main thread

bcrypt password verification - CPU-intensive work can block that process's event loop

Other requests handled by this process may wait while the synchronous CPU work runs.

With Cluster
----------------
Worker 1

Independent process

Worker 2

Independent process

Worker 3

Independent process

Worker 4

Independent process

Incoming connections can be distributed across workers, allowing multiple CPU cores to execute JavaScript concurrently.


Important: Cluster doesn't make each password verification faster. It allows multiple requests to be processed by different workers at the same time.

const numCPUs = os.cpus().length;
Suppose your machine reports 8 logical CPUs.numCPUs = 8;
Your code will attempt to create eight worker processes.


} else {
  connectDB().then(() => {
    app.listen(process.env.PORT, () =>
      console.log(
        `auth-service worker ${process.pid} on ${process.env.PORT}`
      )
    );
  });
}


When a worker starts, it:

Connects to the database.

Waits for the connection promise to resolve.

Starts the Express HTTP server on the configured port.

Handles incoming requests.

For example, if the port is 5000, all workers can listen on port 5000. The cluster module coordinates the workers so they can accept connections on the shared port.

One important database consideration: each worker calls connectDB(). If you start eight workers, you may have eight separate database connections or connection pools. Make sure the total connection count is within your database's capacity.


Step 5: Restart a worker if it crashes
--------------------------------------
cluster.on('exit', (worker, code, signal) => {
  console.log(
    `Worker ${worker.process.pid} exited (${signal || code}) — restarting`
  );

  cluster.fork();
});



Suppose Worker 2 crashes unexpectedly.

The primary process detects the exit and creates a replacement worker.

Event

	

Result




Worker 1 is running

	

Continues serving requests.




Worker 2 crashes

	

Its process stops.




exit event fires

	

Primary detects the exit.




cluster.fork() executes

	

A replacement worker starts.




3. What happens when a user logs in?
--------------------------------------
Consider your authentication flow:

Client
  |
  v
Auth Service — port 5000
  |
  v
Cluster distributes connections
  |
  +----> Worker 1
  +----> Worker 2
  +----> Worker 3
  +----> Worker 4
             |
             v
      Login API / bcrypt
             |
             v
          Database


The cluster does not choose the worker based on the API route or user identity. Connection distribution is managed by Node.js and the operating system.

Also, clustering does not mean the database is automatically shared through process memory. Each worker has its own memory. Shared data should be stored in an appropriate shared system, such as your database or Redis.


cluster.ts is the process-management entry point. It starts multiple instances of your Express auth service, waits for each worker's database connection, and replaces workers that exit. Your app.ts defines the HTTP application; cluster.ts determines how that application is run across processes.