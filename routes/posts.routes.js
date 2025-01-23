const express = require('express');
const router = express.Router();
const {getUserFeed,createPost,deletePost,likePost,unLikePost} = require('../controllers/posts.controller');
const {auth} = require('../middleware');

router.get('/feed',auth,getUserFeed);
router.post('/post',auth,createPost); //the peson who created post can delete only
router.delete('/post/:id',auth,deletePost);
router.post('/like-post/:id',auth,likePost);
router.delete('/unlike-post/:id',auth,unLikePost);

module.exports = router;