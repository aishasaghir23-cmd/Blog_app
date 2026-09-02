const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { protect } = require("../middleware/auth");

const signToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});


const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};


router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (await User.findOne({ email })) {
    return res.status(400).json({ msg: "Email already registered" });
  }
  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hash });

  res
    .cookie("token", signToken(user), cookieOptions)
    .status(201)
    .json({ user: publicUser(user) });
});


router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  const ok = user && (await bcrypt.compare(password, user.password));

  if (!ok) return res.status(400).json({ msg: "Invalid credentials" });

  res
    .cookie("token", signToken(user), cookieOptions)
    .status(200)
    .json({ user: publicUser(user) });
});


router.get("/me", protect, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(401).json({ msg: "No user" });
  res.json({ user: publicUser(user) });
});


router.post("/logout", (req, res) => {
  res.clearCookie("token", cookieOptions);
  res.json({ msg: "Logged out" });
});

module.exports = router;
