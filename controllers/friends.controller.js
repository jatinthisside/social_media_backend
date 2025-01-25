const con = require("../utils/db");
const { z } = require("zod");

// getAllFriends,sendFriendRequest,acceptFriendRequest,declineFriendRequest,removeFriend,

exports.getAllFriends = async (req, res) => {
    try{
        const userId = req.params.id;
        if (!userId) {
          return res.status(401).json({
            success: false,
            message: "User id is required to fetch friends",
          });
        }
        const friends =
          await con.query(`select case when sender_id = ${userId} then receiver_id else sender_id end as friend_id, u.full_name as friend_name,
            u.profile_url as profile_pic
           from friendship f
          join users u 
            on u.user_id = case 
                             when f.sender_id = ${userId} then f.receiver_id
                             else f.sender_id
                           end
          where (f.sender_id = ${userId} or f.receiver_id = ${userId})
            and f.status = 'accepted';
              `);
      
              if(friends[0][0].length <= 0){
                  return res.status(404).json({
                      success: true,
                      message: 'Not Frieds found!'
                  })
              }
      
              return res.status(200).json({
                  success: true,
                  message: 'Friends got!',
                  friends:friends[0][0]
              })
    }catch(error){
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            Error: error.message,
          });
    }
};

exports.getAllPendingFriendships=async(req,res)=>{
    try{
        const userId = req.params.id;
        if (!userId) {
          return res.status(401).json({
            success: false,
            message: "User id is required to fetch pending req",
          });
        }
        const friends =
          await con.query(`select case when sender_id = ${userId} then receiver_id else sender_id end as friend_id, u.full_name as friend_name,
            u.profile_url as profile_pic
           from friendship f
          join users u 
            on u.user_id = case 
                             when f.sender_id = ${userId} then f.receiver_id
                             else f.sender_id
                           end
          where (f.sender_id = ${userId} or f.receiver_id = ${userId})
            and f.status = 'pending';
              `);
      
              if(friends[0][0].length <= 0){
                  return res.status(404).json({
                      success: true,
                      message: 'Not pending requests found!'
                  })
              }
      
              return res.status(200).json({
                  success: true,
                  message: 'all requests got!',
                  friends:friends[0][0]
              })
    }catch(error){
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            Error: error.message,
          });
    }
}

exports.sendFriendRequest = async (req, res) => {
  try {
    const senderId = req.user.userId;
    const reciverId = Number(req.params.id);
    console.log({senderId, reciverId});
    const isPresent = await con.query(
      `select user_id from users where user_id = ${reciverId}`
    );
    console.log(Object.entries(isPresent[0][0]).length == 1);
    if (Object.entries(isPresent[0][0]).length == 0) {
      return res.status(404).send({
        success: false,
        message: "you can send requests to valid users ony!",
      });
    }
    if (!reciverId) {
      return res.status(404).send({
        success: false,
        message: "receiver id is required to send req!",
      });
    }
    if (reciverId === senderId) {
      return res.status(301).send({
        success: false,
        message: "you can't send friend request to yourself!",
      });
    }
    console.log('Just before isRedAl');
    const isReqAlreadySent = await con.query(`select * from friendship where (sender_id = ${senderId} AND receiver_id = ${reciverId}) OR (sender_id = ${reciverId} AND receiver_id = ${senderId})`);
    console.log("isRequested : ",isReqAlreadySent[0]);
    if (Object.entries(isReqAlreadySent[0]).length > 0) {
      return res.status(301).json({
        success: false,
        message: "Request already sent to user, or he is friend of yours",
      });
    }

    await con.query(`insert into friendship(sender_id,receiver_id)values(${senderId},${reciverId})`);

    return res.status(200).json({
      success: true,
      message: "Request sent successfully!",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      Error: error.message,
    });
  }
};

exports.acceptFriendRequest = async (req, res) => {
  try {
    const friendship_id = req.params.id;
    const userId = req.user.userId;
    if (!friendship_id) {
      return res.status(301).json({
        success: false,
        message: "friendship_id id is required to accept request!",
      });
    }
    const validFriendship = await con.query(
      `select * from friendship where friendship_id = ${friendship_id}`
    );
    if (validFriendship[0][0].length <= 0) {
      return res.status(301).json({
        success: false,
        message: "invalid friendship id!",
      });
    }
    if (validFriendship[0][0].status == "pending" && (validFriendship[0][0].receiver_id == userId)) {
      await con.query(
        `update friendship set status = "accepted" where friendship_id = ${friendship_id}`
      );
      return res.status(200).json({
        success: true,
        message: "Friend request accepted!",
      });
    } else {
      return res.status(301).json({
        success: false,
        message: "friend request is either already accepted or declined!",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      Error: error.message,
    });
  }
};

exports.declineFriendRequest = async (req, res) => {
  try {
    const friendship_id = req.params.id;
    const userId = req.user.userId;
    if (!friendship_id) {
      return res.status(301).json({
        success: false,
        message: "friendship_id id is required to decline request!",
      });
    }
    const validFriendship = await con.query(
      `select * from friendship where friendship_id = ${friendship_id}`
    );
    if (validFriendship[0][0].length <= 0) {
      return res.status(301).json({
        success: false,
        message: "invalid friendship id!",
      });
    }
    if (validFriendship[0][0].status == "pending" && (validFriendship[0][0].receiver_id == userId)) {
      await con.query(
        `update friendship set status = "declined" where friendship_id = ${friendship_id}`
      );
      return res.status(200).json({
        success: true,
        message: "Friend request declined!",
      });
    } else {
      return res.status(301).json({
        success: false,
        message: "friend request is either already accepted or declined!",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      Error: error.message,
    });
  }
};

exports.removeFriend = async (req, res) => {
  try {
    const userId = req.user.userId
    const friendship_id = req.params.id;
    if (!friendship_id) {
      return res.status(301).json({
        success: false,
        message: "friendship_id id is required to remove friend!",
      });
    }
    const validFriendship = await con.query(
      `select * from friendship where friendship_id = ${friendship_id}`
    );
    if (validFriendship[0][0].length <= 0) {
      return res.status(301).json({
        success: false,
        message: "invalid friendship id!",
      });
    }
    if (validFriendship[0][0].status == "accepted" && (validFriendship[0][0].sender_id == userId || validFriendship[0][0].receiver_id == userId)) {
      await con.query(
        `delete from friendship where status = "accepted" AND friendship_id = ${friendship_id}`
      );
      return res.status(200).json({
        success: true,
        message: "Friend removed from friend list!",
      });
    } else {
      return res.status(301).json({
        success: false,
        message: "friend request is either declined or pending!",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      Error: error.message,
    });
  }
};

exports.cancelRequest = async (req, res) => {
  try {
    const friendship_id = req.params.id;
    const userId = req.user.userId;
    if (!friendship_id) {
      return res.status(301).json({
        success: false,
        message: "friendship_id id is required to cancel request!",
      });
    }
    const validFriendship = await con.query(
      `select * from friendship where friendship_id = ${friendship_id}`
    );
    if (validFriendship[0][0].length <= 0) {
      return res.status(301).json({
        success: false,
        message: "invalid friendship id!",
      });
    }
    if (validFriendship[0][0].status == "pending" && (validFriendship[0][0].receiver_id == userId)) {
      await con.query(
        `delete from friendship where status = "pending" AND friendship_id = ${friendship_id}`
      );
      return res.status(200).json({
        success: true,
        message: "Friend request cancelled!",
      });
    } else {
      return res.status(301).json({
        success: false,
        message: "friend request is either declined or accepted!",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      Error: error.message,
    });
  }
};

exports.friendshipSuggestions = (req, res) => {
  try {
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      Error: error.message,
    });
  }
};
