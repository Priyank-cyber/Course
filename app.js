const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const bcrypt = require('bcrypt');
const db = require("./config/db");
const crypto = require('crypto');
const sendConfirmationEmail = require("./public/js/sendEmail");
const cors = require('cors');

const app = express();

// CORS configuration
const corsOptions = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // allows session cookies to be sent back and forth
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: {
      maxAge: 30 * 60 * 1000,
      secure: true, // cookie is only sent over HTTPS
      httpOnly: true // Preventing client-side JavaScript from accessing the cookie
  }
}));


app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", "views");

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/register", (req, res) => {
  res.render("register", { success: "", error: "", accMsg: "" });
});

app.get("/login", (req, res) => {
  res.render("login", { emailError: "", error: "", passwordError: "" });
});

app.post("/register", (req, res) => {
  const { fullName, email, mobile, password } = req.body;

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      console.error("Error hashing password:", err);
      return res.render("register", { success: "", error: "Error in user registration", accMsg: "" });
    }

    const checkQuery = 'SELECT * FROM users WHERE email = ? OR mobile = ?';
    db.query(checkQuery, [email, mobile], (checkErr, checkResult) => {
      if (checkErr) {
        console.error(checkErr);
        return res.render("register", { success: "", error: "Error in user registration", accMsg: "" });
      }

      if (checkResult.length > 0) {
        const existingUser = checkResult[0];
        if (existingUser.email === email) {
          return res.render("register", { success: "", error: "Email address is already registered", accMsg: "" });
        } else if (existingUser.mobile === mobile) {
          return res.render("register", { success: "", error: "Mobile number is already registered", accMsg: "" });
        }
      }

      const token = crypto.randomBytes(20).toString('hex');

      const insertQuery = 'INSERT INTO users (fullName, email, mobile, password, confirmation_token, account_status) VALUES (?, ?, ?, ?, ?, ?)';
      db.query(insertQuery, [fullName, email, mobile, hashedPassword, token, 'pending'], (insertErr, insertResult) => {
        if (insertErr) {
          console.error(insertErr);
          return res.render("register", { success: "", error: "Error in user registration" });
        }

        if (sendConfirmationEmail(email, token)) {
          res.render("register", { success: "User Registered Successfully. Please check your email to confirm your account.", error: "", accMsg: "" });
        } else {
          res.render("register", { success: "", error: "Email Sent for verification", accMsg: "" });
        }
      });
    });
  });
});

app.get("/confirm/:token", (req, res) => {
  const token = req.params.token;

  const query = 'SELECT * FROM users WHERE confirmation_token = ?';
  db.query(query, [token], (err, result) => {
    if (err) {
      console.error(err);
      return res.send("Error confirming your account. Please try again later.");
    }

    if (result.length === 0) {
      return res.send("Invalid confirmation token.");
    }

    const user = result[0];

    if (user.account_status !== 'pending') {
      return res.send("Account is already activated.");
    }

    const updateQuery = 'UPDATE users SET account_status = ? WHERE confirmation_token = ?';
    db.query(updahteQuery, ['active', token], (updateErr, updateResult) => {
      if (updateErr) {
        console.error(updateErr);
        return res.send("Error activating your account. Please try again later.");
      }
      res.render("register", { success: "", error: "", accMsg: "Account is Activated Now. You can log in now" });
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

    if (user.account_status !== "active") {
      return res.render("login", { error: "Account is not active. Please contact support.", emailError: "", passwordError: "" });
    }

    bcrypt.compare(password, user.password, (compareErr, match) => {
      if (compareErr) {
        console.error(compareErr);
        return res.render("login", { error: "Error in login", emailError: "", passwordError: "" });
      }

      if (!match) {
        let remainingAttempts = user.login_attempts - 1;
        if (remainingAttempts <= 0) {
          const freezeAccountQuery = 'UPDATE users SET login_attempts = ?, account_status = ? WHERE email = ?';
          db.query(freezeAccountQuery, [0, 'frozen', email], (freezeErr) => {
            if (freezeErr) {
              console.error(freezeErr);
              return res.render("login", { error: "Error freezing account", emailError: "", passwordError: "" });
            }
            return res.render("login", { error: "Account is frozen due to too many incorrect login attempts. Please contact support.", emailError: "", passwordError: "" });
          });
        } else {
          const updateAttemptsQuery = 'UPDATE users SET login_attempts = ? WHERE email = ?';
          db.query(updateAttemptsQuery, [remainingAttempts, email], (updateErr) => {
            if (updateErr) {
              console.error(updateErr);
              return res.render("login", { error: "Error updating login attempts", emailError: "", passwordError: "" });
            }
            return res.render("login", { error: `Incorrect password. Only ${remainingAttempts} attempt(s) remaining.`, emailError: "", passwordError: "" });
          });
        }
      } else {
        const resetAttemptsQuery = 'UPDATE users SET login_attempts = ?, account_status = ? WHERE email = ?';
        db.query(resetAttemptsQuery, [3, 'active', email], (resetErr) => {
          if (resetErr) {
            console.error(resetErr);
            return res.render("login", { error: "Error resetting login attempts", emailError: "", passwordError: "" });
          }

          req.session.user = user;
          if (user.role === "user") {
            res.render("user", { fullName: user.fullName, enrolledCourses: "", id: user.id });
            // req.session.user = user;
            // req.session.isLoggedIn = true;
          } else {
            res.render("admin", { fullName: user.fullName, enrolledCourses: "", id: user.id });
            // req.session.user = user;
            // req.session.isLoggedIn = true;
          }
        });
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
  const userId = req.query.userId;
  console.log("The id is ", userId);
  const query = 'SELECT * FROM courses';
  db.query(query, (err, courses) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Error fetching courses");
    }
    res.render("courses", { courses: courses, userId: userId });
  });
});

app.post("/addUserCourse", (req, res) => {
  const userId = req.query.userId;
  const courseId = req.body.courseId;

  const checkQuery = 'SELECT * FROM user_courses WHERE userId = ? AND courseId = ?';
  db.query(checkQuery, [userId, courseId], (checkErr, checkResult) => {
    if (checkErr) {
      console.log(checkErr);
      return res.status(500).send("Error checking course association");
    }

    if (checkResult.length > 0) {
      return res.status(400).send("Course already added to user's account");
    }

    const insertQuery = 'INSERT INTO user_courses (userId, courseId) VALUES (?, ?)';
    db.query(insertQuery, [userId, courseId], (insertErr, insertResult) => {
      if (insertErr) {
        console.log(insertErr);
        return res.status(500).send("Error adding course to user's account");
      }
      res.status(200).send("Course added to user's account successfully");
    });
  });
});

app.get("/enrolledCourses", (req, res) => {
  const userId = req.query.userId;

  const query = 'SELECT c.* FROM courses c JOIN user_courses uc ON c.id = uc.courseId WHERE uc.userId = ?';
  db.query(query, [userId], (err, enrolledCourses) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Error fetching enrolled courses");
    }

    res.render("enrol", { enrolledCourses: enrolledCourses });
  });
});

app.get("/activate", (req, res) => {
  const query = "SELECT * FROM users WHERE account_status IN ('frozen', 'pending', 'deactive')";
  db.query(query, (e, r) => {
    console.log(r);
    res.render("activateuser.ejs", { r: r });
  });
});

app.post("/activateUser", (req, res) => {
  const userEmail = req.body.email;

  const updateQuery = 'UPDATE users SET account_status = ? WHERE email = ?';
  db.query(updateQuery, ['active', userEmail], (err, result) => {
    if (err) {
      console.error("Error activating user:", err);
      return res.status(500).send("Error activating user");
    }
    res.status(200).send("User activated successfully");
  });
});

app.post("/editattempts", (req, res) => {
  const userEmail = req.body.email;
  const attempts = req.body.attempts;

  const updateQuery = 'UPDATE users SET login_attempts = ? WHERE email = ?';
  db.query(updateQuery, [attempts, userEmail], (err, result) => {
    if (err) {
      console.error("Error updating login attempts:", err);
      return res.status(500).send("Error updating login attempts");
    }
    res.status(200).send("Login attempts updated successfully");
  });
});

app.get("/editattempts", (req, res) => {
  const query = "SELECT * FROM users";
  db.query(query, (e, r) => {
    console.log(r);
    res.render("editattempts.ejs", { r: r });
  });
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Error logging out");
    }
    // Clear the isLoggedIn item in session storage
    // req.session.isLoggedIn = false;
    res.clearCookie('connect.sid'); // Clear the session cookie
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate'); // Prevent caching
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.redirect("/login");
  });
});


app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running at port ${process.env.PORT || 3000}`);
});
