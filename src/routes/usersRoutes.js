const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const router = express.Router();

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

router.get("/getAllUsers", checkToken, async (req, res) => {
  const users = await User.find();

  res.send(users);
});

module.exports = router;
