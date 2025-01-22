const express = require('express');
const router = express.Router();
const {Signup,Signin,getUserDetails,updateProfile,deleteProfile} = require('../controllers/users.controller');
const {auth} = require('../middleware');

console.log("Inside api routes : ");

router.post('/signup',Signup);
router.post('/signin',Signin);
router.get('/profile/:id',auth,getUserDetails);
router.put('/profile/:id',auth,updateProfile);
router.delete('/profile/:id',auth,deleteProfile);

module.exports = router;