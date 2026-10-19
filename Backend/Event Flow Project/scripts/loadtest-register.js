const autocannon = require('autocannon');

// Each request needs a unique email — the unique index would otherwise turn this into a
// 409-only test after the first request instead of a real registration-throughput test.
autocannon(
  {
    url: 'http://127.0.0.1:8080',
    connections: 50,
    duration: 10,
    requests: [
      {
        method: 'POST',
        path: '/api/auth/register',
        headers: { 'content-type': 'application/json' },
        setupRequest: (req) => {
          const id = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
          req.body = JSON.stringify({
            email: `loadtest_${id}@example.com`,
            password: 'password123',
            firstName: 'Load',
            lastName: 'Test',
            mobileNumber: '9999999999',
          });
          return req;
        },
      },
    ],
  },
  (err, result) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(autocannon.printResult(result));
  }
);
