import crypto from "crypto"
import redis from "../Redis/Connect.js";



export async function tokengenerate() {
     const token = crypto.randomBytes(32).toString("hex");
     await redis.set(`clientToken:${token}`, "valid", "EX", 86400);
    return token;
    
}