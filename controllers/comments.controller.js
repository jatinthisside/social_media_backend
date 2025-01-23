const con = require("../utils/db");
const { z } = require("zod");

exports.totalComments=async(req,res)=>{
  try{
    const postId = req.params.id;
    if(!postId){
        return res.status(301).json({
            success:false,
            message:"post id is required to fetch all comments!"
        })
    }
    const posts = await con.query(`select * from posts where post_id = ${postId}`);
    if(posts[0][0].length <= 0){
        return res.status(404).json({
            success:false,
            message:"No post with id"
        })
    }

    const comments = await con.query(`select Count(comment_id) AS totalComments from comments where post_id = ${postId}`) 
    return res.status(200).json({
        success:true,
        message: "got total comments!",
        comments: comments[0][0].totalComments
    })
  }catch(error){
    return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        Error:error.message
    })
  }
}

exports.addComment=async(req,res)=>{
    try{
       const postId = req.params.id;
       const userId = req.user.userId;
       const {content} = req.body;
       if(!postId){
        return res.status(401).json({
          success:false,
          message: "post id is required to add comment!"
        }) 
       }
       if(!userId){
        return res.status(401).json({
          success:false,
          message: "only logged in users are allowed to comment on a post!"
        }) 
       }
      
       const validateContent = z.string("Comment must be a valid string").max(150,"Comment should be no longer than 150 characters");
       const validatedContent = validateContent.safeParse(content);
       if(!validatedContent.success){
        return res.status(301).json({
            success:false,
            message: "invalid comment format!"
        })
       }

       await con.query(`insert into comments(post_id,user_id,content)values(${postId},${userId},"${validatedContent.data}")`);
       return res.status(200).json({
        success:true,
        message: "Comment added to post"
       })

    }catch(error){
      return res.status(500).json({
          success: false,
          message: "Internal Server Error",
          Error:error.message
      })
    }
}

exports.deleteComment=async(req,res)=>{
    try{
       const commentId = req.params.id;
       const userId = req.user.userId;
       if(!commentId){
        return res.status(404).json({
            success:false,
            message: "Comment id is required!"
        })
       }
       if(!userId){
        return res.status(404).json({
            success:false,
            message: "user id is required to delete comment!"
        })
       }
       const comment = await con.query(`select * from comments where comment_id = ${commentId}`);
       if(comment[0][0].length <= 0){
        return res.status(401).json({
            success:false,
            message:'Not comment found with id'
        })
       }
       if(!comment[0][0].user_id == userId){
            return res.status(403).json({
                success:false,
                message:'You can only delete your own comments'
            })
       }else{
         await con.query(`delete from comments where comment_id = ${commentId}`);
         return res.status(200).json({
            success:true,
            message:'Comment deleted successfully!'
         })
       }
    }catch(error){
      return res.status(500).json({
          success: false,
          message: "Internal Server Error",
          Error:error.message
      })
    }
}

exports.likeComment=async(req,res)=>{
    try{
        const commentId = await req.params.id;
        const userId = await req.user.userId;
        if(!commentId){
            return res.status(301).json({
                success: false,
                message: "invalid comment id provided!",
            })
        }
        // one person can only like once
       const isCommentAlreadyLiked = await con.query(`select * from comment_likes where comment_id = ${commentId} AND user_id = ${userId}`);
    
       if(isCommentAlreadyLiked[0].length>0){
        return res.status(300).json({
            success: false,
            message: "You can like a comment only once!"
        })
       } 

       await con.query(`insert into comment_likes(user_id,comment_id)values(${userId},${commentId})`);
       await con.query(`update comments set like_count = like_count + 1 where comment_id = ${commentId}`);
       return res.status(200).json({
        success:true,
        message:"comment liked Succesfully!"
       })
    }catch(error){
      return res.status(500).json({
          success: false,
          message: "Internal Server Error",
          Error:error.message
      })
    }
}

exports.unLikeComment=async(req,res)=>{
    try{
        const commentId = req.params.id;
     const userId = req.user.userId;
     if(!commentId){
      return res.status(401).json({
        success:false,
        message: "commentId is required to remove like!"
      }) 
     }
     if(!userId){
      return res.status(401).json({
        success:false,
        message: "only logged in users are allowed to unlike a comment!"
      }) 
     }
     await con.query(`delete from comment_likes where comment_id = ${commentId} AND user_id = ${userId}`);
     await con.query(`update comments set like_count = like_count-1 where comment_id = ${commentId}`);
     return res.status(200).json({
      success:true,
      message:'like removed from comment!'
     })
    }catch(error){
      return res.status(500).json({
          success: false,
          message: "Internal Server Error",
          Error:error.message
      })
    }
}