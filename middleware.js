const jwt = require('jsonwebtoken');
const con = require('./utils/db');
require('dotenv').config()

exports.auth = async(req,res,next) => {
    try{
       const token = req.headers.authorization;
       if(!token) return res.status(500).json({success:false,message:"Login to access this route!"});
       var decoded = jwt.verify(token, process.env.JWT_SECRET);
      
       const user = await con.query(`Select * from users where email = "${decoded.email}"`);

       if(user[0].length<=0) {
        return res.status(401).json({
          success:false,
          message:'User with email not exist!'
        })
       }
       
       req.user = user[0][0];
       
       if(user[0].length > 0){
         next();
       }else{
          return res.status(302).json({
            success: false,
            message: 'This is a protected route login first to access this route!'
          });
       }
    }catch(err){
        console.log('Error in auth middleware: ' + err.message);
        return res.status(500).json({
            success: false,
            message:'Error while authenticating',
            error: err.message
        });
    }
}