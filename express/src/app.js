const express = require("express");
const app = express();
const Signup = require("./signupschema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const port = process.env.PORT || 8000;

const secretKey = process.env.SECRETKEY; // Make sure to use a strong secret key in production

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

app.post("/signup", async (req, res) => {
  try {
    const { username, email, password, cpassword } = req.body;
    console.log("Request body:", req.body);

    // Check if passwords match
    if (password !== cpassword) {
      console.log("Passwords do not match");
      return res.status(400).send("Passwords do not match");
    }

    // Check if user already exists
    const existingUser = await Signup.findOne({ email });
    if (existingUser) {
      console.log("User already exists");
      return res
        .status(400)
        .send(`User already exists  <a href="/login">Login</a>`);
    }

    // Create a new signup instance
    const signup1 = new Signup({ username, email, password });

    // Save the user to the database
    const welcome = await signup1.save();
    console.log("User successfully created:", welcome);

    // Generate a JWT token
    const token = jwt.sign(
      { id: welcome._id, username: welcome.username },
      secretKey,
      { expiresIn: "1h" }
    );

    // Send the token and created user data as the response
    res.status(201).json({ token, user: welcome });
  } catch (error) {
    console.log("Error creating user:", error.message);
    res.status(500).send("Error creating user: " + error.message);
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const finding = await Signup.findOne({ email });
  if (!finding) {
    return res
      .status(500)
      .json({ message: "thi email does not exist in out database" });
  }
  const comparing = await bcrypt.compare(password, finding.password);
  if (!comparing) {
    return res.status(500).json({ message: "password does not match" });
  }
  const token = jwt.sign(
    { id: finding._id, username: finding.username },
    secretKey,
    { expiresIn: "2hr" }
  );
  res.status(200).json({ token, message: "login successful" });
});

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.listen(port, () => {
  console.log(`App is running on port ${port}`);
});
