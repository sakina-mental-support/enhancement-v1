const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

// ── Smart fallback responses when Python AI is offline ──
const FALLBACKS = {
  sad: "I hear you. You don't have to be okay right now. I'm here with you.",
  anxious: "Let's slow things down together. Take a breath — what's the loudest thought right now?",
  stressed: "One thing at a time. You're doing your best and that is enough.",
  angry: "It's okay to feel this way. What's the heaviest part of it?",
  fearful: "You are safe here. Let's ground ourselves — feel your feet on the floor.",
  overwhelmed: "Let's simplify everything. Just one single breath for now.",
  neutral: "I'm here to listen. Tell me what's on your mind.",
};

const getFallback = (text = "") => {
  const t = text.toLowerCase();
  if (/sad|cry|depress|hopeless|lonely/.test(t)) return FALLBACKS.sad;
  if (/anxious|panic|worry|scared|nervous/.test(t)) return FALLBACKS.anxious;
  if (/stress|exhaust|tired|drain|burnout/.test(t)) return FALLBACKS.stressed;
  if (/angry|rage|frustrat|hate|mad/.test(t)) return FALLBACKS.angry;
  if (/scared|fear|afraid/.test(t)) return FALLBACKS.fearful;
  if (/overwhelm|too much|can't cope/.test(t)) return FALLBACKS.overwhelmed;
  return FALLBACKS.neutral;
};

// POST /api/chat
router.post("/", authMiddleware, async (req, res, next) => {
  try {
    const { text, message, context, conversationId } = req.body;
    const inputText = text || message || "";
    const userId = req.user.id || req.user._id;

    if (!inputText) {
      return res.status(400).json({ success: false, message: "Text is required" });
    }

    // Save user message (non-blocking — don't fail if DB write fails)
    let convId = conversationId || null;
    try {
      if (!convId) {
        const newConv = await Conversation.create({ user: userId, title: inputText.substring(0, 30) });
        convId = newConv._id;
      } else {
        // Update the conversation's updatedAt timestamp
        await Conversation.findByIdAndUpdate(convId, { updatedAt: new Date() });
      }
      await Message.create({ conversationId: convId, sender: "user", content: inputText });
    } catch (dbErr) {
      console.warn("DB write skipped:", dbErr.message);
    }

    // Try calling Python AI service
    const pythonAiUrl = process.env.PYTHON_AI_URL || "http://127.0.0.1:5001/api/chat";
    let aiResponse = null;
    let aiEmotionTag = null;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000); // 8s timeout

      const pyRes = await fetch(pythonAiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText, user_id: userId, context }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (pyRes.ok) {
        const pyData = await pyRes.json();
        aiResponse = pyData.response || pyData.message || null;
        aiEmotionTag = pyData.emotion?.primary_emotion || null;
      }
    } catch (pyErr) {
      console.warn("Python AI offline, using fallback:", pyErr.message);
    }

    // Use fallback if Python didn't respond
    if (!aiResponse) {
      aiResponse = getFallback(inputText);
    }

    // Save AI reply
    if (convId && aiResponse) {
      await Message.create({
        conversationId: convId,
        sender: "ai",
        content: aiResponse,
        emotionTag: aiEmotionTag,
      }).catch((e) => console.error("Error saving AI message:", e));
    }

    res.status(200).json({
      success: true,
      data: { response: aiResponse },
      conversationId: convId,
    });

  } catch (error) {
    console.error("Chat route error:", error);
    // Always return something — never leave frontend hanging
    res.status(200).json({
      success: true,
      data: { response: getFallback(req.body?.text || "") },
    });
  }
});

// POST /api/chat/tts
router.post("/tts", authMiddleware, async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ success: false, message: "Text required" });

    const pythonTtsUrl = (process.env.PYTHON_AI_URL || "http://127.0.0.1:5001/api/chat").replace("/chat", "/tts");

    const response = await fetch(pythonTtsUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) throw new Error(`TTS failed: ${response.status}`);
    const ttsData = await response.json();
    res.status(200).json({ success: true, audio_base64: ttsData.audio_base64 });
  } catch (error) {
    res.status(200).json({ success: false, message: "TTS unavailable" });
  }
});

// GET /api/chat/conversations - Retrieve all conversations for the logged-in user
router.get("/conversations", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const conversations = await Conversation.find({ user: userId }).sort({ updatedAt: -1 });
    res.status(200).json({
      success: true,
      data: conversations
    });
  } catch (error) {
    console.error("Failed to retrieve conversations:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/chat/history/:conversationId - Retrieve all messages for a specific conversation
router.get("/history/:conversationId", authMiddleware, async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 });
      
    res.status(200).json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error("Failed to retrieve chat history:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
