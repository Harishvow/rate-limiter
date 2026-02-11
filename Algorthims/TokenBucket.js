import cache from "../Cache/Cacheconnect.js";

function TokenBucket(capacity) {
  return {
    tokens: capacity,
    lastRefill: Date.now()
  };
}

function getBucket(role, identifier, capacity) {
  const key = `bucket:${role}:${identifier}`;

  const data = cache.get(key);

  if (!data) {
    return TokenBucket(capacity);
  }

  return {
    tokens: parseFloat(data.tokens),
    lastRefill: parseInt(data.lastRefill)
  };
}

function refillToken(bucket, capacity, refillRatePerSec) {
  const time = Date.now();
  const diff = time - bucket.lastRefill;
  const sec = diff / 1000;

  const tokenadd = sec * refillRatePerSec;

  bucket.tokens = bucket.tokens + tokenadd;

  if (bucket.tokens > capacity) {
    bucket.tokens = capacity;
  }

  bucket.lastRefill = time;
}

function consumeToken(role, identifier, capacity, refillRatePerSec) {
  const key = `bucket:${role}:${identifier}`;

  let bucket = cache.get(key);

  if (!bucket) {
    bucket = TokenBucket(capacity);
  }

  refillToken(bucket, capacity, refillRatePerSec);

  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    cache.set(key, bucket, 60);

    return true;
  }
  cache.set(key, bucket, 300);

  return false;
}

function roleconfig(role) {
  const rolesconfig = {
    guest: { capacity: 10, refillRatePerSec: 1 },
    user: { capacity: 50, refillRatePerSec: 2 },
    paid: { capacity: 200, refillRatePerSec: 5 },
    admin: { capacity: 500, refillRatePerSec: 10 }
  };

  return rolesconfig[role] || rolesconfig["guest"];
}

export function tokenBucketLimiter({}) {
  return function (req, res, next) {
    let identifier;
    let role;

    if (req.user && req.user.id) {
      identifier = req.user.id;
      role = req.user.role;
    } 
    else if (req.headers["x-client-token"]) {
      identifier = req.headers["x-client-token"];
      console.log(identifier);
      role = "guest";
    } 
    else {
      identifier = req.ip;
      role = "guest";
    }

    const config = roleconfig(role);

    const allowed = consumeToken(
      role,
      identifier,
      config.capacity,
      config.refillRatePerSec
    );

    if (!allowed) {
      return res.status(429).json({
        message: "Too many requests"
      });
    }

    next();
  };
}
