if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}
// console.log(process.env);

const mongoose = require("mongoose");
const express = require("express");
const app = express();
const { Job } = require("./models/jobs.js");
const path = require("path");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const mongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/user.js");
const Candidate = require("./models/candidate.js");
const multer = require("multer");
const { storage } = require("./cloudConfig.js");
const upload = multer({ storage });
// const isLoggedin = require("./middleware.js");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const db_URL = process.env.ATLAS_URL;
main()
  .then(() => {
    console.log("Connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(db_URL);
}
const store = mongoStore.create({
  mongoUrl: db_URL,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("err", () => {
  console.log(err);
});

const sessionOption = {
  secret: "mtSecretKey",
  resave: true,
  saveUninitialized: true,
  cookies: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOption));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.err = req.flash("err");
  res.locals.currUser = req.user;
  next();
});

app.get("/", (req, res) => {
  res.redirect("/job");
});

app.get("/job", async (req, res) => {
  try {
    let jobs = await Job.find();
    res.render("jobs/index.ejs", { jobs });
  } catch (error) {
    req.flash("err", err.message);
    res.redirect("/job");
  }
});

app.post("/job/search", async (req, res) => {
  try {
    let search = req.body;
    search = search.search;
    let job = await Job.find({ title: search });
    job = job[0];
    console.log(job.title);
    req.flash("success", "find successfully");
    res.render("jobs/show.ejs", { job });
  } catch (err) {
    req.flash("err", err.message);
    res.redirect("/job");
  }
});

app.get("/job/dashboard", async (req, res) => {
  let applications = await Candidate.find();
  // console.log(applications)
  res.render("jobs/dashboard.ejs", { applications });
});

app.get("/job/process", async (req, res) => {
  // let jobs = await Job.find();
  res.render("jobs/process.ejs");
  // try {
  // } catch (error) {
  //   req.flash("err", err.message);
  //   res.redirect("/job");
  // }
});

app.get("/job/:id", async (req, res) => {
  try {
    let { id } = req.params;
    let job = await Job.findById(id);
    // console.log(job);
    // res.send("oks")
    res.render("jobs/show.ejs", { job });
  } catch (error) {
    req.flash("err", err.message);
    res.redirect("/job/:id");
  }
});

app.get("/signup", (req, res) => {
  try {
    res.render("users/signup.ejs");
  } catch (error) {
    req.flash("err", err.message);
    res.redirect("/signup");
  }
});

app.post("/signup", async (req, res) => {
  try {
    let { username, email, password } = req.body;
    const newUser = new User({ email, username });
    let registerUser = await User.register(newUser, password); // register method
    // console.log(registerUser);
    req.flash("success", "Signup Successfully");
    res.redirect("/job");
  } catch (err) {
    req.flash("err", err.message);
    res.redirect("/signup");
  }
});

app.get("/login", (req, res) => {
  try {
    res.render("users/login.ejs");
  } catch (error) {
    req.flash("err", err.message);
    res.redirect("/login");
  }
});

app.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  async (req, res) => {
    req.flash("success", "sign in successfully");
    res.redirect("/job");
  }
);

app.get("/logout", (req, res, next) => {
  try {
    req.logout((err) => {
      if (err) {
        next(err);
      }
      req.flash("success", "Logout Successfully");
      res.redirect("/job");
    });
  } catch (error) {
    req.flash("err", err.message);
    res.redirect("/job");
  }
});

app.get("/job/:id/candidate", (req, res, next) => {
  try {
    if (!req.isAuthenticated()) {
      req.flash("err", "Log-in must required");
      return res.redirect("/login");
    }
    let { id } = req.params;
    res.render("jobs/candidate.ejs", { id });
  } catch (error) {
    req.flash("err", err.message);
    res.redirect("/job/:id/candidate");
  }
});

app.post("/job/:id/candidate", upload.single("image"), async (req, res) => {
  try {
    const url = req.file.path;
    const filename = req.file.filename;
    // console.log(url)
    // console.log(filename)
    let user = req.user;
    let { id } = req.params;
    let domain = await Job.findById(id);
    // console.log(job);
    let { name, email, mobile, qualification } = req.body;
    let applicant = new Candidate({
      name,
      email,
      mobile,
      qualification,
      domain,
      user,
    });
    applicant.image = { url, filename };
    let newapplicant = await applicant.save();
    // console.log(newapplicant);
    req.flash("success", "Your Application Sended Successfully....!");
    res.redirect("/job");
  } catch (err) {
    req.flash("err", err.message);
    res.redirect("/job/:id/candidate");
  }
});

app.listen(8080, () => {
  console.log(`server listen at port : http://localhost:8080`);
});
