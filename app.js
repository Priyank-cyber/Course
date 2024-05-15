const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session")
const bcrypt = require('bcrypt');;
const db = require("./config/db");

const app = express();

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 30 * 60 * 1000 }
}));

app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", "views");

app.get("/", (req, res) => {
  res.render("home")
});

app.get("/register", (req, res) => {
  res.render("register",{success:"",error:""})
});

app.get("/login", (req, res) => {
  res.render("login",{emailError: "", error:"",passwordError:""})
});

app.post("/register", (req, res) => {
  const { fullName, email, mobile, password } = req.body;

  // Hash the password
  bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
          console.error("Error hashing password:", err);
          return res.render("register", { success: "", error: "Error in user registration" });
      }

      const checkQuery = 'SELECT * FROM users WHERE email = ? OR mobile = ?';
      db.query(checkQuery, [email, mobile], (checkErr, checkResult) => {
          if (checkErr) {
              console.error(checkErr);
              return res.render("register", { success: "", error: "Error in user registration" });
          }

          if (checkResult.length > 0) {
              const existingUser = checkResult[0];
              if (existingUser.email === email) {
                  return res.render("register", { success: "", error: "Email address is already registered" });
              } else if (existingUser.mobile === mobile) {
                  return res.render("register", { success: "", error: "Mobile number is already registered" });
              }
          }

          const insertQuery = 'INSERT INTO users (fullName, email, mobile, password) VALUES (?, ?, ?, ?)';
          db.query(insertQuery, [fullName, email, mobile, hashedPassword], (insertErr, insertResult) => {
              if (insertErr) {
                  console.error(insertErr);
                  return res.render("register", { success: "", error: "Error in user registration" });
              }
              
              return res.render("register", { success: "User Registered Successfully", error: "" });
          });
      });
  });
});
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [email], (err, result) => {
      if (err) {
          console.error(err);
          return res.render("login", { error: "Error in login", emailError: "", passwordError: "" });
      }

      if (result.length === 0) {
          return res.render("login", { emailError: "Email not found", error: "", passwordError: "" });
      }

      const user = result[0];

      // Compare hashed password with provided password
      bcrypt.compare(password, user.password, (compareErr, match) => {
          if (compareErr) {
              console.error(compareErr);
              return res.render("login", { error: "Error in login", emailError: "", passwordError: "" });
          }

          if (!match) {
              return res.render("login", { passwordError: "Incorrect password", emailError: "", error: "" });
          }

          req.session.user = user;
          if (user.role == "user") {
              res.render("user", { fullName: user.fullName, enrolledCourses: "", id: user.id });
          } else {
              res.render("admin", { fullName: user.fullName, enrolledCourses: "", id: user.id });
          }
      });
  });
});

app.post("/addCourse", (req, res) => {
  const { courseCode, courseName, credits } = req.body;

  const insertQuery = 'INSERT INTO courses (courseCode, courseName, credits) VALUES (?, ?, ?)';
  db.query(insertQuery, [courseCode, courseName, credits], (err, result) => {
      if (err) {
          console.log(err);
          return res.status(500).send("Error in adding course");
      }
      
      return res.status(200).send("Course added successfully");
  });
});


app.get("/courses", (req, res) => {
  const userId = req.query.userId
  console.log("The id is ",userId)
  const query = 'SELECT * FROM courses';
  db.query(query, (err, courses) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Error fetching courses");
    }
    res.render("courses", { courses: courses,userId:userId });
  });
});

// Assuming you have the necessary modules required and database connection established

app.post("/addUserCourse", (req, res) => {
  const userId = req.query.userId; // Assuming you pass userId in the query parameter
  const courseId = req.body.courseId; // Assuming you pass courseId in the request body

  // Check if the course is already added to the user's account
  const checkQuery = 'SELECT * FROM user_courses WHERE userId = ? AND courseId = ?';
  db.query(checkQuery, [userId, courseId], (checkErr, checkResult) => {
    if (checkErr) {
      console.log(checkErr);
      return res.status(500).send("Error checking course association");
    }

    if (checkResult.length > 0) {
      // Course already exists in user's account
      return res.status(400).send("Course already added to user's account");
    }

    // If the course is not already associated with the user, insert it
    const insertQuery = 'INSERT INTO user_courses (userId, courseId) VALUES (?, ?)';
    db.query(insertQuery, [userId, courseId], (insertErr, insertResult) => {
      if (insertErr) {
        console.log(insertErr);
        return res.status(500).send("Error adding course to user's account");
      }
      // Course added successfully
      res.status(200).send("Course added to user's account successfully");
    });
  });
});


app.get("/enrolledCourses", (req, res) => {
  const userId = req.query.userId;

  // Query to fetch enrolled courses for the user
  const query = 'SELECT c.* FROM courses c JOIN user_courses uc ON c.id = uc.courseId WHERE uc.userId = ?';

  db.query(query, [userId], (err, enrolledCourses) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Error fetching enrolled courses");
    }

    // Render the 'user.ejs' view with the enrolled courses data
    res.render("enrol", { enrolledCourses: enrolledCourses });
  });
});

// app.get("/deletecourse", (req, res) => {
//     const userId = req.query.userId;
//     db.query("SELECT * FROM user_courses WHERE userId = ?", [userId], (err, result) => {
//         if (err) {
//             // Handle the error
//             console.error("Error fetching user courses:", err);
//             res.status(500).send("Error fetching user courses");
//             return;
//         }
//         // Render the deletecourse page with the fetched user courses
//         res.render("deletecourse", { userId: userId, userCourses: result });
//     });
// });


app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running at port ${process.env.PORT || 3000}`);
});