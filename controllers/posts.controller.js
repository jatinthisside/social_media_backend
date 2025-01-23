const con = require("../utils/db");
const { z } = require("zod");

exports.getUserFeed = async(req,res)=>{
    try{

    }catch(error){
      return res.status(500).json({
          success: false,
          message: "Internal Server Error",
          Error:error.message
      })
    }
}

exports.createPost = async(req,res)=>{
  try{
     const {content,media_url,privacy} = req.body;
     const {userId,email,username,name} = req.user;

     if(!userId || !email || !username || !name){
        return res.status(401).json({
            success:false,
            message:"user is required to create post!"
        })
     }
     const validatePost = z.object({
        content:z.string().min(25,"Content must be atleast 25 characters long").max(250,"content should be less than 250 characters"),
        media_url:z.string().optional(),
        privacy:z.string().optional(),    
     })

     const postData = validatePost.safeParse(req.body);

     if(!postData.success) {
        return res.status(301).json({
           success:false,
           message:"invalid input provided!"    
        })
     }

     const postPrivacy = privacy || 'public';
          

     const post = await con.query(`insert into posts(user_id,content,privacy,media_url)values(${userId},"${content}","${postPrivacy}",${media_url || null})`)
    return res.status(200).json({
        success: true,
        message: "Post created successfully!",
        post:post[0][0]
    })   
  }catch(error){
    return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        Error:error.message
    })
  }
}

exports.deletePost = async(req,res)=>{
    try{
       const post_id = req.params.id; 
       if(!post_id){
        return res.status(401).json({
            success:false,
            message:'post_id is required to delete a post!'
        })
       }
       const user_id = req.user.userId;
       const post = await con.query(`select user_id from posts where post_id = ${post_id}`);
       if(post[0][0].length<=0){
        return res.status(301).json({
            success:false,
            message:'post not exi!'
          })
       }
       if(post[0][0].user_id == user_id){
        await con.query(`delete from posts where post_id = ${post_id}`);
        return res.status(200).json({
           success:true,
           message:'post deleted successfully!'
         })
       }else{
         throw new Error('You can only delete posts created by yourself!');
       }
    }catch(error){
      return res.status(500).json({
          success: false,
          message: "Internal Server Error",
          Error:error.message
      })
    }
}

exports.likePost = async(req,res)=>{
    try{
        const postId = await req.params.id;
        const userId = await req.user.userId;
        if(!postId){
            return res.status(301).json({
                success: false,
                message: "invalid post id provided!",
            })
        }
        // one person can only like once
       const isPostAlreadyLiked = await con.query(`select * from post_likes where post_id = ${postId} AND user_id = ${userId}`);
    //    console.log("isPostLiked:",isPostAlreadyLiked[0]);
       if(isPostAlreadyLiked[0].length>0){
        return res.status(300).json({
            success: false,
            message: "You can like a post only once!"
        })
       } 

       await con.query(`insert into post_likes(user_id,post_id)values(${userId},${postId})`);
       await con.query(`update posts set like_count = like_count + 1 where post_id = ${postId}`);
       return res.status(200).json({
        success:true,
        message:"Post liked Succesfully!"
       })
    }catch(error){
      return res.status(500).json({
          success: false,
          message: "Internal Server Error",
          Error:error.message
      })
    }
}

// we have post_likes table , when user like a post , posts like count associated with post_id increases and 
// add row in post_likes
// user_id ^^ post_id

exports.unLikePost=async(req,res)=>{
  try{
     const postId = req.params.id;
     const userId = req.user.userId;
     if(!postId){
      return res.status(401).json({
        success:false,
        message: "post id is required to remove like!"
      }) 
     }
     if(!userId){
      return res.status(401).json({
        success:false,
        message: "only logged in users are allowed to like a post!"
      }) 
     }
     await con.query(`delete from post_likes where post_id = ${postId} AND user_id = ${userId}`);
     await con.query(`update posts set like_count = like_count-1 where post_id = ${postId}`);
     return res.status(200).json({
      success:true,
      message:'like removed from post!'
     })
  }catch(error){
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      Error:error.message
  })
  }
}