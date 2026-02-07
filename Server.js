import express from "express";
import { tokenBucketLimiter } from "./Algorthims/TokenBucket.js";


const app = express();

app.use(tokenBucketLimiter({
  capacity: 10,
  refillRatePerSec:5
}));


app.get("/api/hello",(req,res)=>{
    res.json({ok:true,message:"hello world "})
});

const port=process.env.PORT ||3000;
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});