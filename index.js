const express = require("express");
const flash = require("flash");
const mongoose = require("mongoose");
const session = require('express-session');
const path = require("path");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const app = express();
const cors = require('cors');
app.use(cors({
    origin: '*'
}));

mongoose.connect("mongodb://localhost:27017/alphaTrading");
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
  console.log("Database connected");
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static('public'))
app.engine("ejs", ejsMate);



const sessionConfig = {
  secret: 'thisshouldbeabettersecret!',
  resave: false,
  saveUninitialized: true,
  cookie: {
      httpOnly: true,
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
      maxAge: 1000 * 60 * 60 * 24 * 7
  }
}
app.use(session(sessionConfig))
app.use(flash());
app.use(passport.initialize());
app.use(passport.session()); 
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get('/login', (req,res)=>{
  res.send('Working!')
})

app.post('/register', async (req, res, next) => {
  try {
    const { email, username, password } = req.body;
    const user = new User({ email, username });
    const registeredUser = await User.register(user, password);
    res.send(registeredUser);
     
  } catch (e) {
     res.redirect('register');
  }
});

app.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
  res.send(`Welcome ${req.user.username}`)
})

app.get('/logout', (req,res)=>{
  if(req.user){
    req.logout();
    return res.send(`Goodbye `);
  }
  else{
    res.send("Not logged in")
  }  
})

app.post('/sell', async(req,res)=>{
  const {title, quantity,price}= req.body;
  const username = req.user.username;
  console.log(username);
  const user = await User.findOne({username:username});
  console.log(user);
  wallet= user.Wallet;
  res.send(user);
  try{
    let flag=0;
    for(let i=0;i<user.stock.length;i++){
      if(user.stock[i].title==title){
          //console.log(temp);
          
          const newQuan = user.stock[i].quantity;
          const oldprice= user.stock[i].price;
          console.log("oldproce:"+oldprice);
          console.log("price:"+price);
          console.log("quantity:"+quantity);
          const profit= newQuan*oldprice - quantity*price;
          await User.findOneAndUpdate(
            { _id: user._id, "stock.title": title},
            { 'stock.$.quantity': parseInt(newQuan) - parseInt(quantity)}
          );
          console.log("profit"+profit);
          flag=1;
      };
    }
    //console.log(price*quantity);
    if(flag==0){
      res.send("stock not found!")
    }
    const newVal=wallet+ price*quantity;
    //console.log(newVal);
    await User.findOneAndUpdate(
      { _id: user._id }, 
      { Wallet: newVal}
    );
    //console.log(user.Wallet);
  }
  catch(e){
    console.log(e);
  }
      
       
  
})

app.post('/buy', async(req,res)=>{
  const {title, quantity,price}= req.body;
  const stoc= [{title:title,
      price:price,
      quantity:quantity
  }
  ];
  const username = req.user.username;
  console.log(username);
  const user = await User.findOne({username:username});
  console.log(user);
  wallet= user.Wallet;
  res.send(user);
  try{
    let flag=0;
    for(let i=0;i<user.stock.length;i++){
      if(user.stock[i].title==title){
          //console.log(temp);
          
          newQuan = user.stock[i].quantity;
          const oldprice= user.stock[i].price;
          const total= parseInt(quantity) + parseInt(newQuan)
          const avg= (newQuan*oldprice + quantity*price)/total;
          await User.findOneAndUpdate(
            { _id: user._id, "stock.title": title},
            { 'stock.$.quantity': parseInt(quantity) + parseInt(newQuan), 'stock.$.price': avg }
          );
          flag=1;
      };
    }
      
       
    console.log(price*quantity);
    if(flag==0){
      await User.findOneAndUpdate(
        { _id: user._id }, 
        { $push: { stock: stoc } }
      );
    }
    const newVal=wallet- price*quantity;
    console.log(newVal);
    await User.findOneAndUpdate(
      { _id: user._id }, 
      { Wallet: newVal}
    );
    console.log(user.Wallet);
  }
  catch(e){
    console.log(e);
  }
})

app.get('/temp', async (req,res)=>{
 // console.log(req);
  const username = req.body.username;
  console.log(username);
  const user = await User.findOne({username:username});
  console.log(user);
  wallet= user.Wallet;
  res.send(user);
  try{   
    const stoc= [{title:"tesla",
      price:55,
      quantity:1
    }
    ];
    console.log(stoc.price*stoc.quantity);
    await User.findOneAndUpdate(
      { _id: user._id }, 
      { $push: { stock: stoc } }
    );
    const newVal=wallet- 9;
    console.log(newVal);
    await User.findOneAndUpdate(
      { _id: user._id }, 
      { Wallet: newVal}
    );
    console.log(user.Wallet);
  }
  catch(e){
    console.log(e);
  }
})

app.listen(3001, ()=>{
  console.log("App is listening on port 3001")
})