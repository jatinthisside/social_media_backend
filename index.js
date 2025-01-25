const express = require('express');
const app = express();
app.use(express.json());
require('dotenv').config();
const userRoutes = require('./routes/users.routes');
const postRoutes = require('./routes/posts.routes');
const commentRoutes = require('./routes/comments.routes');
const friendRoutes = require('./routes/friends.routes');

app.use('/api/v1',userRoutes);
app.use('/api/v1',postRoutes);
app.use('/api/v1',commentRoutes);
app.use('/api/v1',friendRoutes);

app.listen(process.env.PORT,()=>{
   console.log(`Listening on port ${process.env.PORT}`);    
})