import express from "express";
import cookieParser from "cookie-parser";
import { tokenBucketLimiter } from "./Algorthims/TokenBucket.js";
import { tokengenerate } from "./ClientToken/tokenid.js";



const app = express();
app.use(cookieParser());
app.use((req, res, next) => {
  const role = req.headers["x-role"];
  const id = req.headers["x-user-id"];

  if (role && id) {
    req.user = { id, role };
  }

  next();
});
app.use(tokenBucketLimiter({}));



app.get("/api",async(req,res)=>{
  let token=req.cookies.clientToken
  if(!token){
    token = await tokengenerate();
    res.cookie("clientToken", token, {
      httpOnly: true,
      maxAge: 86400 * 1000
    });
  }
  
  res.json({ clientToken: token });
});
 
app.get("/hello",async(req,res)=>{
  res.json({"hell":"hii"})
})
app.get("/test/admin", (req, res) => {
  req.user = { id: "1", role: "user" };
  res.json({ message: "Admin test" });
});
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(` http://localhost:${port}`);
});