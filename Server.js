import express from "express";
import { tokenBucketLimiter } from "./Algorthims/TokenBucket.js";
import { tokengenerate } from "./ClientToken/tokenid.js";


const app = express();

app.use(tokenBucketLimiter({}));


app.get("/api",async(req,res)=>{
  const token = await tokengenerate();
  res.json({ clientToken: token });
});

const port=process.env.PORT ||3000;
app.listen(port, () => {
  console.log(`http://localhost:3000`);
});