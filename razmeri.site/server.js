// server.js - Entry point for ZARMERI backend

const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const authRoutes = require("./routes/auth");

// Load .env variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", authRoutes);

// DB Connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));
// server.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch((err) => console.error('DB Connection Error:', err));

// models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: String,
  emailOrPhone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  zarmId: { type: String, unique: true },
}, { timestamps: true });

export default mongoose.model('User', userSchema);

// routes/auth.js
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

function generateZarmId() {
  return 'ZARM' + Math.floor(100000 + Math.random() * 900000);
}

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { name, emailOrPhone, password } = req.body;
    const existing = await User.findOne({ emailOrPhone });
    if (existing) return res.status(400).json({ msg: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      emailOrPhone,
      password: hashed,
      zarmId: generateZarmId()
    });

    await user.save();
    res.status(201).json({ msg: 'User created', zarmId: user.zarmId });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { zarmId, password } = req.body;
    const user = await User.findOne({ zarmId });
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ msg: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });

    res.json({ token, user: { name: user.name, zarmId: user.zarmId } });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

export default router;

// .env (create this file in your root folder)
MONGO_URI=your_mongodb_connection_string_here
JWT_SECRET=your_super_secret_key
PORT=5000