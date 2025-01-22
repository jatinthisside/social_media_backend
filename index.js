const express = require('express');
const app = express();
app.use(express.json());
require('dotenv').config();
const userRoutes = require('./routes/users.routes');
const postRoutes = require('./routes/posts.routes');

app.use('/api/v1',userRoutes);
app.use('/api/v1',postRoutes);

app.listen(process.env.PORT,()=>{
   console.log(`Listening on port ${process.env.PORT}`);    
})