const con = require("../utils/db");
const { hashPassword } = require("../utils/hashPassword");
const { z } = require("zod");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

console.log('Inside controllers : ');

exports.Signup = async (req, res) => {
  try {
    console.log('Signing up');
    const { username, full_name, email, password } = req.body;
    console.log("inside Signup :: ",username,);
    const ValidateUser = z.object({
      username: z
        .string()
        .min(5, "username must be of atleast 5 character long")
        .max(25, "username should be no longer than 25 characters")
        .trim()
        .toLowerCase(),
      full_name: z.string(),
      email: z.string().email().trim(),
      password: z
        .string()
        .trim()
        .min(5, "password must be of atleast 5 character long")
        .max(20, "password should be no longer than 20 characters")
        .trim(),
    });

    const validatedData = ValidateUser.safeParse(req.body);
    //  console.log("Got all fields -> ",name,email,password,typeof(email));
    // console.log('validated data : ',validatedData);
    if(!validatedData.success){
        // console.log('validated error : ',validatedData.error.errors);
        const errorMessages = validatedData.error.errors.map(error => error.message);
        throw new Error(errorMessages);
    }
    const isUserExists = await con.query(
      `select * from users where email = "${validatedData.data.email}"`
    );
    //  console.log('isUserExists',isUserExists);
    if (isUserExists[0].length > 0) {
      return res.status(203).json({
        success: false,
        message: "User already Exist",
      });
    }
    const hashPass = await hashPassword(validatedData.data.password);
    await con.query(
      `insert into users(full_name,email,password_hash,username)values('${validatedData.data.full_name}','${validatedData.data.email}','${hashPass}','${validatedData.data.username}')`
    );
    res
      .status(200)
      .json({ success: true, message: "User registered successfully!" });
  } catch (error) {
    console.error("Error while creating user:", error.message);
    return res
      .status(500)
      .json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
  }
};

exports.Signin = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const identifier = email || username;
    if (!identifier || !password) {
        return res.status(400).json({ error: "Email or username and password are required" });
    }
    const user = await con.query(
      `select * from users where email = "${identifier}" OR username = "${identifier}"`
    );

    const hash = user[0][0].password_hash;
    
    if (user.length <= 0) {
      return res
        .status(402)
        .json({ success: false, message: "no user with email or  username!" });
    }
    let isPassMatched = await bcrypt.compare(password, hash);
    //    console.log('isMatched ->',isPassMatched);
    if (isPassMatched == false) {
      return res
        .status(301)
        .json({ success: false, message: "Password Mismatch!" });
    } else {
     
      var token = jwt.sign({ email: email,username:username,name:user[0][0]?.full_name,bio:user[0][0]?.bio,privacy_level:user[0][0]?.privacy_level,profile_url:user[0][0]?.profile_url }, process.env.JWT_SECRET);
      
      // console.log("Signin hadler token : ", token);
      return res.status(200).json({
        success: true,
        message: "Login Succesfull!",
        token: token,
      });
    }
  } catch (error) {
    console.error("Error while login:", error.message);
    return res
      .status(500)
      .json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
  }
};

exports.getUserDetails=async(req,res)=>{
    try{
      const {id} = req.params;
      if(!id){
        return res
          .status(401)
          .json({
            success: false,
            message: "id is missing!",
          });
      }
      const profile = await con.query(`select * from users where user_id = ${id}`);
      if(profile[0].length<=0){
        return res
          .status(401)
          .json({
            success: false,
            message: "user with id not found!",
          });
      }

      profile[0][0].password_hash = undefined;
      
      return res.status(200).json({
        success: true,
        message: "User profile fetched successfully!",
        Profile:profile[0][0]
      })
    }catch(error){
        console.error("Error while getting profile info:", error.message);
        return res
          .status(500)
          .json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
          });
    }
}

exports.updateProfile=async(req,res)=>{
   try{
      const {id} = req.params;
      if(!id){
        return res.status(401).json({
          success:false,
          message:"To update profile user id is required!",
        })
      }
      const {full_name,bio,privacy_level,profile_url} = req.body;
      const user = req.user;
      const validatProfile = z.object({
         full_name:z.string('Name must be a string').max(20,"Name should be no more than 20 character long").optional(),  
         password:z.string('Password must be a string').min(6,'password must be 6 characters long').optional(), 
         bio:z.string().optional(),
         privacy_level:z.string().optional(),
         profile_url:z.string().optional(),
      }) 
      const profileData = validatProfile.safeParse(req.body);
      if(!profileData.success){
        return res.status(301).json({
          success: false,
          message:'Incorrect input format!'
        })
      }
      const updatedUser = await con.query(`Update users set full_name = "${profileData.data.full_name || user.full_name}" , bio = "${profileData.data.bio || user.bio}" , privacy_level = "${profileData.data.privacy_level || user.privacy_level}" , profile_url = "${profileData.data.profile_url || user.profile_url}"`);
      console.log("Updated data: " , updatedUser);
      if(updatedUser[0].length<=0){
          return res.status(501).json({
            success: false,
            message:'Unable to update profile'
          })
      }
      return res.status(200).json({
        success: true,
        message:'Profile updated successfully!',
        Profile: updatedUser[0][0]
      })
   }catch(error){
    console.error("Error while updating user profile", error.message);
    return res
      .status(500)
      .json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
   }
}

exports.deleteProfile=async(req,res)=>{
  try{
    const {id} = req.params;
    if(!id){
      return res
        .status(401)
        .json({
          success: false,
          message: "id is missing!",
        });
    }
    const profile = await con.query(`select * from users where user_id = ${id}`);
    if(profile[0].length<=0){
      return res
        .status(401)
        .json({
          success: false,
          message: "user with id not found!",
        });
    }

    await con.query(`delete from users where user_id = ${id}`);

    return res.status(200).json({
      success: true,
      message: "User profile deleted successfully!",
    })
  }catch(error){
      console.error("Error while getting profile info:", error.message);
      return res
        .status(500)
        .json({
          success: false,
          message: "Internal Server Error",
          error: error.message,
        });
  }
}