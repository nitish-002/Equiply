const jwt=require('jsonwebtoken');
const User = require('../db/models/user.js');

const tokenSecret=process.env.TOKEN_SECRET

module.exports=async (req,res,next)=>{
    console.log('Auth middleware - All headers:', req.headers);
    console.log('Auth middleware - x-access-token:', req.headers["x-access-token"]);

    const token=req.headers["x-access-token"];

    if(!token) {
        console.log('Auth middleware - No token found');
        return res.status(403).json({success:false,message:"No valid token found"})
    }

    try{
        console.log('Auth middleware - Verifying token:', token);
        const decode=jwt.verify(token,tokenSecret)
        console.log('Auth middleware - Decoded token:', decode);
        
        req.userId= decode.userId;

        // Check if user is banned
        const user = await User.findById(req.userId);
        if (!user) {
            console.log('Auth middleware - User not found:', req.userId);
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (user.status === "banned") {
            console.log('Auth middleware - User is banned:', req.userId);
            return res.status(403).json({
                success: false,
                message: "Your account has been banned. Please contact support."
            });
        }
        
        console.log('Auth middleware - Authentication successful for user:', req.userId);
        next();
    }catch(err){
        console.log('Auth middleware - Token verification failed:', err.message);
        return res.status(401).json({success:false,message:"Token is expired or corrupt"})
    }
}