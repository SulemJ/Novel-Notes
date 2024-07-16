import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import pg from "pg";

const app = express();
const port = 3000;
const db = new pg.Client({
    host: "localhost",
    database: "book",
    port: "5432",
    user: "postgres",
    password: "firstAccount#1",
  });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

db.connect();

// gets all the reviews in the review table and puts them in alphabetic order of the reviewer's name
async function getReview(){
 const result = await db.query("select * from users join review on (users.id = user_id) order by name ;");
 const reviewList = [];
 result.rows.forEach( element => {
 reviewList.push(element);
  });
 return reviewList;
 };

// gives us the id of the user after accepting the reviewer's name
async function getUserId(name){
  try {
     const result = await db.query(`SELECT id FROM users WHERE name = '${name}'`);
    const userId = result.rows[0].id;
    return userId;
  } catch (error) {
    console.error("Failed to make request:", error.message);
  }
};
// first render
app.get("/", (req, res)=>{
  res.render("cover.ejs");
});
// render after the cover picture is clicked
app.get("/home", async (req,res) => {
 const reviewList = await getReview();
 res.render("index.ejs", {
    listItems: reviewList,
  });
});
// write and create account page
app.get("/write", (req, res) => {
  res.render("add.ejs");
});
// when the create account btn is clicked this gets activated and it send's the following queries to postgres
app.post("/user", async (req,res) =>{
  const user = req.body.name; 
  try {
 await db.query(`insert into users(name) values('${user}')`);
  console.log("congrats you're one of us now");
    res.render("add.ejs");
  } catch (error) {
    console.error("Failed to make request:", error.message);
    res.render("index.ejs", {
      error: error.message,
    });
  }
});
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
     res.redirect("/home");
  } catch (error) {
    console.error("Failed to make request:", error.message);
    res.render("index.ejs", {
      error: error.message,
    });
  }
});
// when the "Read Full Summary" btn is clicked this get's the review and display it in summary.ejs
app.post("/summary", async(req,res)=>{
 let str = req.body.deleteItemId;
 console.log(str);
 let result = await db.query(`select review from review where id = ${str}`);
 console.log();
 let full = result.rows[0].review;
 res.render("summary.ejs", {
  full: full,
 });
});
// delete a review but disabled 
app.post("/delete", async (req, res) => {
 let str = req.body.deleteItemId;
   await db.query(`delete from review where id = ${str}`);
   res.redirect("/");
});







app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
  