const express = require('express');
const router = express.Router();
const JournalEntry = require('../models/JournalEntry');
const authMiddleware = require('../middleware/authMiddleware');

// Save a new journal entry
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { text, detectedMood, reflectionQuestion } = req.body;
        const entry = await JournalEntry.create({
            userId: req.user.id || req.user._id,
            text,
            detectedMood: detectedMood || 'neutral',
            reflectionQuestion,
            wordCount: text.split(' ').length
        });
        res.status(201).json({ success: true, data: entry });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Get all journal entries for the logged-in user
router.get('/', authMiddleware, async (req, res) => {
    try {
        const entries = await JournalEntry.find({ userId: req.user.id || req.user._id })
            .sort({ createdAt: -1 })
            .limit(30);
        res.json({ success: true, data: entries });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
