const express = require('express');
const router = express.Router();
const {getAllFriends,sendFriendRequest,acceptFriendRequest,declineFriendRequest,removeFriend,friendshipSuggestions,getAllPendingFriendships} = require('../controllers/friends.controller');
const {auth} = require('../middleware');

router.get('/friendship/:id',getAllFriends); //Not working
router.post('/freindship/request/:id',auth,sendFriendRequest);
router.put('/friendship/accept/:id',auth,acceptFriendRequest);
router.put('/friendship/decline/:id',auth,declineFriendRequest); //also delete the friendship
router.delete('/friendship/remove/:id',auth,removeFriend);
router.get('/friendship/suggestions',auth,friendshipSuggestions); //Pending
router.get('/friendship/pending',auth,getAllPendingFriendships); //pending
module.exports = router;