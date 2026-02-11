import express from "express";
import { tokenBucketLimiter } from "./Algorthims/TokenBucket.js";
import { tokengenerate } from "./ClientToken/tokenid.js";
import redis from "./Cache/Cacheconnect.js"


const app = express();

app.use(tokenBucketLimiter({}));


app.get("/api",async(req,res)=>{
  const token = await tokengenerate();
  res.json({ clientToken: token });
});


async function startServer() {
  await redis.ping();
  console.log("Redis Ready");

  app.listen(3000, () => {
    console.log("http://localhost:3000");
  });
}

startServer();