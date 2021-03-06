const createError = require("http-errors");
const express = require("express");
const path = require("path");  
const cookieParser = require("cookie-parser"); 
const session = require("cookie-session"); 
const bodyParser = require("body-parser"); 
const debug = require("debug")("personalapp:server"); 
const layouts = require("express-ejs-layouts");
require('dotenv').config()
const Post = require('./models/Post')
const User = require('./models/User')



const mongoose = require( 'mongoose' );

mongoose.connect( process.env.mongodb_URI, { useNewUrlParser: true } );
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function() {console.log("MongoDB connected")});






const app = express();


app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");



app.use(layouts);


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));


app.use(express.static(path.join(__dirname, "public")));


app.use(
  session({
    secret: process.env.secret, 
    resave: false,
    saveUninitialized: false
  })
);



const auth = require('./routes/authentication')
app.use(auth)


const isLoggedIn = (req,res,next) => {
  if (res.locals.loggedIn) {
    next()
  }
  else res.redirect('/login')
}

app.get("/", async (req, res, next) => {
  
  if (req.session.user == null){
    res.render("index");

  }
  else{
    const posts = await Post.find().populate("user", "_id username")
    res.locals.posts = posts.slice(-5).reverse()
    // console.log(res.locals.posts)
    res.render("feed")
  }
  // console.log("hellow")
  // console.log(req.session.username)
}
  // fetchPosts()
// }
);

app.get("/post", isLoggedIn, (req, res, next) =>{
  res.render("post")
})

app.post('/post',
  async (req,res,next) =>{
    try {
      const {content} = req.body
      if (content.length < 1){
        res.redirect('/post')
      }else {
          const post = new Post(
            {
              content: content,
              user: req.session.user
            }
          )
          post.save()
          // req.session.username = user.username
          // req.session.user = user
          res.redirect('/')
        // }
        
        
      }
    }catch(e){
      next(e)
    }
  })

app.get("/feed", isLoggedIn, (req, res) => {
  res.render("feed")
})

app.get("/about", (req, res) =>{
  res.render("about")
})

async function fetchPosts(username){

  try{
    console.log("calling on fetchPosts")

    if (username != null){
      const posts = await Post.find().sort({"created_at": -1})
      .populate("user", "_id username")
  
      app.locals.posts = posts.slice(-3)
      console.log(res.locals.posts[0])
      return posts
    }
  }catch (e) {
    console.log(e);
  }

  
}




app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {

  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});



const port = process.env.PORT || "8000";
app.set("port", port);


const http = require("http");
const req = require("express/lib/request");
const res = require("express/lib/response");
const server = http.createServer(app);

server.listen(port);

function onListening() {
  var addr = server.address();
  var bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  debug("Listening on " + bind);
}

function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  var bind = typeof port === "string" ? "Pipe " + port : "Port " + port;


  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

server.on("error", onError);

server.on("listening", onListening);

module.exports = app;
