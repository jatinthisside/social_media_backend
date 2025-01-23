const express = require('express');
const router = express.Router();
const {addComment,deleteComment,likeComment,unLikeComment,totalComments} = require('../controllers/comments.controller');
const {auth} = require('../middleware');

router.get('/comment',auth,totalComments);
router.post('/comment',auth,addComment); //the peson who created post can delete only
router.delete('/comment/:id',auth,deleteComment);
router.post('/like-comment/:id',auth,likeComment);
router.delete('/unlike-comment/:id',auth,unLikeComment);

module.exports = router;