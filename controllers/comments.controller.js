const con = require("../utils/db");
const { z } = require("zod");

exports.totalComments=async()=>{
  try{

  }catch(error){
    return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        Error:error.message
    })
  }
}

exports.addComment=async()=>{
    try{

    }catch(error){
      return res.status(500).json({
          success: false,
          message: "Internal Server Error",
          Error:error.message
      })
    }
}

exports.deleteComment=async()=>{
    try{

    }catch(error){
      return res.status(500).json({
          success: false,
          message: "Internal Server Error",
          Error:error.message
      })
    }
}

exports.likeComment=async()=>{
    try{

    }catch(error){
      return res.status(500).json({
          success: false,
          message: "Internal Server Error",
          Error:error.message
      })
    }
}

exports.unLikeComment=async()=>{
    try{

    }catch(error){
      return res.status(500).json({
          success: false,
          message: "Internal Server Error",
          Error:error.message
      })
    }
}