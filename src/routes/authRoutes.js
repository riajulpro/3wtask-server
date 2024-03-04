const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const router = express.Router();

// Register a new user
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: "User successfully registered" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login into existing account
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ email: user?.email }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: true,
        // secure: process.env.NODE_ENV === "production",
        sameSite: "None",
        // sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      })
      .send({
        userData: user,
        success: true,
        // token: token,
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Logout the existing user
router.delete("/logout", async (req, res) => {
  res
    .clearCookie("token", {
      httpOnly: true,
      secure: true,
      // secure: process.env.NODE_ENV === "production",
      sameSite: "None",
      // sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    })
    .send("User successfully logged out!");
});

// Getting the information from cookies
const checkToken = async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res
      .status(401)
      .send({ message: "Access denied! You do not have a token." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res
        .status(401)
        .send({ message: "There is an error in decoding!" });
    }

    req.user = decoded;
    next();
  });
};

router.get("/getUser", checkToken, async (req, res) => {
  const email = req.user?.email;
  const result = await User.findOne({ email });
  res.send(result);
});

module.exports = router;
