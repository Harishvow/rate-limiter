import Redis from "ioredis";
import crypto from "crypto"

const redis = new Redis("redis://127.0.0.1:6379");


function TokenBucket(capacity){
     return {
     tokens: capacity,
     lastRefill: Date.now()
  };
}
async function getbucket(role,  identifier, capacity){
  const key = `bucket:${role}:${identifier}`;

  const data=await redis.hgetall(key)
  if(Object.keys(data).length==0){
    return TokenBucket(capacity)
  }

  return {
    tokens: parseFloat(data.tokens),
    lastRefill: parseInt(data.lastRefill)
  };

}
function refilltoken(bucket, capacity,refillRatePerSec){
     const time= Date.now();
     const diff=time-bucket.lastRefill;
     const sec=diff/1000
     const tokenadd=sec*refillRatePerSec
     bucket.tokens = bucket.tokens + tokenadd;
     if(bucket.tokens>capacity){
      bucket.tokens=capacity
     }
     bucket.lastRefill = time;
}
async function consumetoken(role,identifier,capacity,refillRatePerSec){
  const key = `bucket:${role}:${identifier}`;
  const bucket=await getbucket(identifier,capacity)
  refilltoken(bucket,capacity,refillRatePerSec)
  if(bucket.tokens>=1){
    bucket.tokens-=1;

    await redis.hset(key, {
      tokens: bucket.tokens,
      lastRefill: bucket.lastRefill
    });
    await redis.expire(key,60)
    return true;
  }
    
   await redis.hset(key, {
      tokens: bucket.tokens,
      lastRefill: bucket.lastRefill
    });
    await redis.expire(key,60)
    return false;

function roleconfig(role){
  const rolesconfig={
      guest: { capacity: 10, refillRatePerSec: 1 },
      user: { capacity: 50, refillRatePerSec: 2 },
      paid: { capacity: 200, refillRatePerSec: 5 },
      admin: { capacity: 500, refillRatePerSec: 10 }
     }
    const config=rolesconfig[role] || roleconfig["guest"]
    return config

}
}
export function tokenBucketLimiter({ capacity, refillRatePerSec }) {
  return async function (req, res, next) {
    let identifier;
    let role;
     if(req.user&&req.user.id){
           identifier=req.user.id
           role = req.user.role;
     }
     else if(req.clientToken){
      identifier=req.clientToken
     }
     else{
        identifier=req.ip
        role = "guest";
     }
     

    const allowed = await consumetoken(ip, capacity, refillRatePerSec);

    if (!allowed) {
      return res.status(429).json({
        message: "Too many requests"
      });
    }

    next();
  };
}
