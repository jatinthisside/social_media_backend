const express = require('express');
const router = express.Router();
const {getUserFeed,createPost,deletePost,likePost} = require('../controllers/posts.controller');
const {auth} = require('../middleware');

router.get('/feed',auth,getUserFeed);
router.post('/post',auth,createPost);
router.delete('/delete/:id',auth,deletePost);
router.post('like-post/:id',auth,likePost);

module.exports = router;