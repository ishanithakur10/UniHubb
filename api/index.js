const express = require('express');
// const mongoUrl = 'mongodb+srv:hpTX20rl6udZB7TI//ishani1251be21:@cluster0.igmdy5z.mongodb.net/?retryWrites=true&w=majority';
const mongoose = require('mongoose');
const cookieParser=require('cookie-parser');
const dotenv = require('dotenv');
const User = require('./models/User');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bcrypt=require('bcryptjs');
const Message=require('./models/Message');
const ws = require('ws');



dotenv.config();
const jwtSecret = process.env.JWT_SECRET;

// mongoose.connect(process.env.MONGO_URL, (err) => {
//     if (err) throw err;
//   });
// Above not working using below 

try {
    mongoose.set('strictQuery', false)
    mongoose.connect(process.env.MONGO_URL) 
    console.log('Mongo connected')
}
catch(error) {
    console.log(error)
}

const bcryptSalt = bcrypt.genSaltSync(10);

const app = express();
app.use(express.json());
 app.use(cookieParser());
 app.use(cors({
    credentials: true, 
    origin:true,
  }));

  async function getUserDataFromRequest(req) {
    return new Promise((resolve, reject) => {
      const token = req.cookies?.token;
      if (token) {
        jwt.verify(token, jwtSecret, {}, (err, userData) => {
          if (err) throw err;
          resolve(userData);
        });
      } else {
        reject('no token');
      }
    });
  
  }

app.get('/test',(req,res)=>{
    res.json('test ok');
});

app.get('/messages/:userId', async (req,res) => {
  const {userId} = req.params;
  const userData = await getUserDataFromRequest(req);
  const ourUserId = userData.userId;
  const messages = await Message.find({
    sender:{$in:[userId,ourUserId]},
    recipient:{$in:[userId,ourUserId]},
  }).sort({createdAt: 1});
  res.json(messages);
});

app.get('/profile',(req,res)=>{
  const token=req.cookies?.token;
  if (token){
    jwt.verify(token,jwtSecret,{},(err,userData)=>{
      if(err) throw err;
     res.json(userData);
    });
  }
  else{
    res.status(401).json('no token');
  }
 
});

app.post('./login',async(req,res)=>{
  const {username,password}=req.body;
  const foundUser = await User.find({username});
  if(foundUser){
   const passOK= bcrypt.compareSync(password,foundUser.password);
   if(passOK){
      jwt.sign({userId:foundUser._id,username},jwtSecret,{},(err,token)=>{
        res.cookie('token',token,{sameSite:'none',secure:true}).json({
          id:foundUser._id,
        });
      });
   }
  }
});

app.post('/register',async(req,res)=>{
    const {username,password} = req.body;
    try {
      const hashedPassword=bcrypt.hashSync(password,bcryptSalt);
        const createdUser = await User.create({
          username:username,
          password:hashedPassword,
        
        });

        jwt.sign({userId:createdUser._id,username}, jwtSecret, {}, (err, token) => {
          if (err) throw err;
          res.cookie('token', token,{sameSite:'none',secure:true}).status(201).json({
            id:createdUser._id ,
        
          });
        });
      } catch(err) {
        if (err) throw err;
        res.status(500).json('error');
      }
});

const server = app.listen(4040, () => {
    console.log('Server is running on http://localhost:4040');
  });

const wss = new ws.WebSocketServer({server});
wss.on('connection', (connection,req)=>{

  //read username and id from the cookie from this connection
  const cookies = req.headers.cookie;
  if (cookies) {
    const tokenCookieString = cookies.split(';').find(str => str.startsWith('token='));
    if (tokenCookieString) {
      const token = tokenCookieString.split('=')[1];
      if (token) {
        jwt.verify(token, jwtSecret, {}, (err, userData) => {
          if (err) throw err;
          const {userId, username} = userData;
          connection.userId = userId;
          connection.username = username;
        });
      }
    }
  }

  connection.on('message',async(message)=>{
    const messageData=JSON.parse(message.toString());
    const {recipient,text}=messageData;
    if(recipient && text){
    const messageDoc = await Message.create({
        sender:connection.userId,
        recipient,
        text,
      });
      [...wss.clients]
        .filter(c=>c.userId===recipient)
        .forEach(c=>c.send(JSON.stringify({
          text,
          sender:connection.userId,
          recipient,
          _id:messageDoc._id
        })));
    }
  });

  //notify everyone about online people
  [...wss.clients].forEach(client=>{
    client.send(JSON.stringify({
     online:[...wss.clients].map(c=> ({userId:c.userId,username:c.username})),
   }));
  });
});

//hpTX20rl6udZB7TI
//thisislovepass

