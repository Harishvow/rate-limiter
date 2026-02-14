Role-Limiter
This is lightWeight Role Based Rate Limiter Package With Custom Config 
Installation
npm install role-limiter
Quick Start
import express from "express";
import { tokenBucketLimiter } from "role-limiter";

const app = express();

app.use(tokenBucketLimiter());

app.get("/hello", (req, res) => {
  res.json({ message: "Hello from Role-Limiter!" });
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
Custom Role Config Usage Example
import express from "express";
import { tokenBucketLimiter } from "role-limiter";

const app = express();

app.use(tokenBucketLimiter({
  roles: {
    guest: { capacity: 5, refillRatePerSec: 1 },
    user: { capacity: 50, refillRatePerSec: 5 },
    premium: { capacity: 500, refillRatePerSec: 50 },
    admin: { capacity: 2000, refillRatePerSec: 200 }
  }
}));

app.get("/api/data", (req, res) => {
  res.json({ message: "Data fetched successfully" });
});

app.listen(3000, () => {
  console.log("http://localhost:3000");
});
How It Works

Role-Limiter uses the Token Bucket Algorithm:

Each user gets a bucket with tokens (capacity)

Each request consumes 1 token

Tokens refill over time (refillRatePerSec)

If tokens are empty → request blocked (429 Too Many Requests)

Role Identification Logic

Role-Limiter detects user role based on the request object:

1️⃣ Authenticated Users (req.user)

If your application sets:

req.user = { id: "101", role: "user" };


Then Role-Limiter will create a bucket key like:

bucket:user:101
2️⃣ Guest Users (Fallback)

If req.user is not present, Role-Limiter falls back to:

x-client-token header (recommended)

or req.ip (default fallback)

Testing Role Based Rate Limiting

You can test roles using Postman or curl.

Example Headers
x-role: user
x-user-id: 101

API Reference
tokenBucketLimiter(config)

Creates a middleware for Express.js.

Parameters
Option	Type	Description
roles	object	Role-based limits (capacity + refillRatePerSec)

Rate Limit Response

When user exceeds limit:

Status Code:
429 Too Many Requests

Response:
{
  "message": "Too many requests"
}

Requirements

Node.js >= 14

Express.js >= 4+

Support
For issues and questions:

GitHub Issues: Report a bug
Email:harisharish982005@gmail.com

Contributing
Contributions are welcome! Please feel free to submit a Pull Request.


