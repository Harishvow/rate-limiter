import crypto from "crypto"
import cache from "../Cache/Cacheconnect.js";


export async function tokengenerate() {


     const token = crypto.randomBytes(32).toString("hex");

     cache.set(`clientToken:${token}`, "valid", 86400); 
    return token;
    
}