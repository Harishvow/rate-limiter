
# Role-Limiter

A lightweight, role-based rate limiter middleware for Express.js. Easily configure custom rate limits for different user roles.

## Features
- Role-based rate limiting (guest, user, paid, admin, etc.)
- Token Bucket algorithm for smooth request handling
- Customizable per-role capacity and refill rates
- Works with authenticated users, guest tokens, or IP fallback
- Easy integration with Express.js

## Installation
```bash
npm install role-limiter
```

## Quick Start
```js
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
```

## Custom Role Config Example
```js
app.use(tokenBucketLimiter({
  roles: {
    guest: { capacity: 5, refillRatePerSec: 1 },
    user: { capacity: 50, refillRatePerSec: 5 },
    premium: { capacity: 500, refillRatePerSec: 50 },
    admin: { capacity: 2000, refillRatePerSec: 200 }
  }
}));
```

## How It Works
- Each user/role gets a token bucket (capacity = max requests)
- Each request consumes 1 token
- Tokens refill over time (refillRatePerSec)
- If tokens are empty, request is blocked (429)

## Role Identification
- **Authenticated users:** `req.user = { id, role }`
- **Guest users:** Uses `x-client-token` header or falls back to `req.ip`
- **Custom headers:** You can send `x-role` and `x-user-id` for testing

## API Reference
### `tokenBucketLimiter(config)`
Creates Express middleware. `config.roles` lets you set per-role limits.

#### Example config
```js
{
  roles: {
    guest: { capacity: 20, refillRatePerSec: 2 },
    user: { capacity: 100, refillRatePerSec: 5 },
    paid: { capacity: 500, refillRatePerSec: 20 },
    admin: { capacity: 1000, refillRatePerSec: 50 }
  }
}
```

### Rate Limit Response
- **Status:** 429 Too Many Requests
- **Body:** `{ "message": "Too many requests" }`

## Requirements
- Node.js >= 14
- Express.js >= 4

## Development
- See `Server.js` for example usage
- Main logic in `Algorthims/TokenBucket.js`

## Support
- [GitHub Issues](https://github.com/your-repo/issues) for bugs/questions
- Email: harisharish982005@gmail.com

## Contributing
Pull requests are welcome! Please open an issue first to discuss changes.

