import cache from "../Cache/Cacheconnect.js";

function TokenBucket(capacity) {
  return {
    tokens: capacity,
    lastRefill: Date.now()
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
    console.log(bucket)
  }

  refillToken(bucket, capacity, refillRatePerSec);

  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    cache.set(key, bucket,300);

    return true;
  }
  cache.set(key, bucket, 300);

  return false;
}

function roleconfig(role) {
  const rolesconfig = {
    guest: { capacity: 20, refillRatePerSec: 2},
    user: { capacity: 100, refillRatePerSec: 5},
    paid: { capacity: 500, refillRatePerSec: 20},
    admin: { capacity: 1000, refillRatePerSec: 50 }
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
