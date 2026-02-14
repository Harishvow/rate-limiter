import express from "express";
import cookieParser from "cookie-parser";
import { tokenBucketLimiter } from "./Algorthims/TokenBucket.js";
import { tokengenerate } from "./ClientToken/tokenid.js";
import { cookiestoken } from "./middleware/clienToken.js";



const app = express();
app.use(cookieParser());
app.use(tokenBucketLimiter({}));
app.use(cookiestoken());
 
app.get("/hello",async(req,res)=>{
  res.json({"hell":"hii"})
})
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(` http://localhost:${port}`);
});