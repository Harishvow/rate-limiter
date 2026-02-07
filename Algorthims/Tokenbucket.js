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