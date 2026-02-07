import Redis from "ioredis";

const redis = new Redis("redis://127.0.0.1:6379");


function TokenBucket(capacity){
     return {
     tokens: capacity,
     lastRefill: Date.now()
  };
}
async function getbucket(ip, capacity){
  const key =`bucket:${ip}`;
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
async function consumetoken(ip,capacity,refillRatePerSec){
  const key =`bucket:${ip}`;
  const bucket=await getbucket(ip,capacity)
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
  




}
export function tokenBucketLimiter({ capacity, refillRatePerSec }) {
  return async function (req, res, next) {
    const ip = req.ip;

    const allowed = await consumetoken(ip, capacity, refillRatePerSec);

    if (!allowed) {
      return res.status(429).json({
        message: "Too many requests"
      });
    }

    next();
  };
}
