import { tokengenerate } from "../ClientToken/tokenid";

export function cookiestoken(){
    return async function(req,res,next){
        let token =req.cookies.clientToken
        if(!token){
            token = tokengenerate
             res. cookies("clienToken",token,{
                httpOnly:true,
                maxAge:8600*1000
             });
        }
        req.clientToken=token;
        next();
    }
}