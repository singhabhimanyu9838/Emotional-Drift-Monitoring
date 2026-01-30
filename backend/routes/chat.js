import express from "express";
import Chat from "../models/Chat.js";
import auth from "../middleware/authMiddleware.js";

const router = express.Router();

// Save message
router.post("/save", auth, async (req, res) => {
  const { role, text } = req.body;

  let chat = await Chat.findOne({ userId: req.user });

  if (!chat) {
    chat = await Chat.create({
      userId: req.user,
      messages: []
    });
  }

  chat.messages.push({ role, text });
  await chat.save();

  res.json({ success: true });
});

// Get history
router.get("/history", auth, async (req, res) => {
  const chat = await Chat.findOne({ userId: req.user });
  res.json(chat?.messages || []);
});

export default router;
