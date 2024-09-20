import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import env from "dotenv";
import session from "express-session";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy } from "passport-local";

const app = express();
const port = 3000;
const saltround = 10;
env.config();
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie:{
      maxAge: 1000 * 60 * 60 *24,
    },
  })
);
const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(passport.initialize());
app.use(passport.session());
db.connect();

// gets all the reviews in the review table and puts them in alphabetic order of the reviewer's name
async function getReview(){
 const result = await db.query("select * from users join review on (users.id = user_id) order by name ;");
 const reviewList = [];
 result.rows.forEach( element => {
 reviewList.push(element);
  });
 return reviewList;
}

// gives us the id of the user after accepting the reviewer's name
async function getUserId(name){
  try {
     const result = await db.query(`SELECT id FROM users WHERE name = '${name}'`);
    const userId = result.rows[0].id;
    return userId;
  } catch (error) {
    console.error("Failed to make request:", error.message);
    res.render("add.ejs", {
      message: "check the name and try again",
    })

  }
};
// render after the cover picture is clicked
app.get("/", async (req,res) => {
 const reviewList = await getReview();
 res.render("index.ejs", {
    listItems: reviewList,
  });
});
// write and create account page
app.get("/write", (req, res) => {
  if(req.isAuthenticated()){
    res.render("add.ejs");
  } else {
     res.redirect("/signup");
  }
});

app.get("/signup", (req, res)=>{
  res.render("signup.ejs");
});

// when the create account btn is clicked this gets activated and it send's the following queries to postgres

app.post("/new", async (req, res) =>{
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
 
  try {
    const result = await db.query(`select * from users where email = '${email}'`);   
    if(result.rows.length > 0){
      res.send("Email already exists. Try logging in.");
    }else {
      bcrypt.hash(password, saltround,  async (err, hash) =>{
      if(err){ 
        console.log("error while hashing password", err);
      }else{
        try {
            const newuser = await db.query(`insert into users(name, email, password) values('${name}', '${email}', '${hash}') RETURNING *;`)       
            const user = newuser.rows[0];
              res.render("add.ejs");
            } catch (error) {
              res.send(error, "please check you email and try again");
            }
      }
     })
    }
  } catch (error) {
    res.send(error, "please try again");
  }
});

// this verify and allow a user that have already an account
app.post(
  "/signin",
  passport.authenticate("local", {
    successRedirect: "/write",
    failureRedirect: "/signup",
  })
);
// when the add review btn is clicked this gets activated and it send's the following queries to postgres
app.post("/add", async (req,res) =>{
      try {
        let str = req.body.name; 
        const userId = await getUserId(str);
        const title = req.body.title;
        const author = req.body.author;
        const rating = req.body.rating;
        const isbn = req.body.isbn;
        const description = req.body.description;
        const review = req.body.review;
        await db.query(`insert into  review(title, author, rating, isbn, short_disc, review, user_id) values('${title}','${author}',${rating},'${isbn}','${description}', '${review}' ,${userId})`);    
        res.redirect("/");
      } catch (error) {
        console.error("Failed to make request:", error.message);
        res.render("add.ejs", {
          message: "please check your name and try again",
        })
      }
});
// when the "Read Full Summary" btn is clicked this get's the review and display it in summary.ejs
app.post("/summary", async(req,res)=>{
 let str = req.body.ItemId;
 let result = await db.query(`select review from review where id = ${str}`);
 let full = result.rows[0].review;
 res.render("summary.ejs", {
  full: full,
 });
});
// delete a review 
app.post("/delete", async (req, res) => {
  // Now we have access to req.user
  // we can access the logged-in user's info from req.user
  if(req.isAuthenticated()){
    const postId = req.body.deleteItemId;
    const userId = req.user.id; 
       await db.query(`delete from review where id = ${postId}`);
    res.redirect("/");
  }else{
    res.redirect("/signup");
  }
});
// shows only the reviews of the particular user it allows to delete the post
app.get("/mine", async (req, res) => {
  if(req.isAuthenticated()){
      const userId = req.user.id; 
      let review = await  db.query(`select * from review where user_id = ${userId};`)
      const reviewList = [];
      review.rows.forEach( element => {
      reviewList.push(element);
    });
    if(reviewList.length == 0){
      res.render("add.ejs", {
        message: "you don't have a review yet, add one here!",
      })
    }else{
      res.render("cover.ejs", {
      listItems: reviewList,
    });
    }
  }else{
    res.redirect("/signup");
  }
});

passport.use(
  "local",
  new Strategy(async function verify(username, password, cb)  {
    try {
      const result = await db.query("SELECT * FROM users WHERE email = $1 ", [
       username,
      ]);
      if (result.rows.length > 0) {
        const user = result.rows[0];
        const storedHashedPassword = user.password;
        bcrypt.compare(password, storedHashedPassword, (err, valid) => {
          if (err) {
            console.error("Error comparing passwords:", err);
            return cb(err);
          } else {
            if (valid) {
              return cb(null, user);
            } else {
              return cb(null, false);
            }
          }
        });
      } else {
        return cb("User not found");
      }
    } catch (err) {
      res.send(err, "please try again");
    }
  })
);

passport.serializeUser((user, cb)=>{ cb(null, user);});

passport.deserializeUser((user, cb) => {
  cb(null, user);
});



app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
  
