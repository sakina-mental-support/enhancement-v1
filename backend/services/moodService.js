const Mood = require("../models/Mood");
const User = require("../models/User");

const createMood = async (userId, moodLevel, note) => {
  if (!moodLevel || moodLevel < 1 || moodLevel > 10) {
    const error = new Error("Mood level must be between 1 and 10");
    error.statusCode = 400;
    throw error;
  }

  const mood = new Mood({
    user: userId,
    moodLevel,
    note,
  });

  await mood.save();

  // حساب متوسط آخر 7 أيام
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);

  const moods = await Mood.find({
    user: userId,
    createdAt: { $gte: lastWeek },
  });

  const average =
    moods.reduce((sum, m) => sum + m.moodLevel, 0) / moods.length;

  let riskLevel = "normal";
  if (average <= 4) riskLevel = "medium";
  if (average <= 2) riskLevel = "high";

  await User.findByIdAndUpdate(userId, {
    isHighRisk: riskLevel === "high",
  });

  return {
    mood,
    weeklyAverage: Number(average.toFixed(2)),
    riskLevel,
  };
};

const getUserMoods = async (userId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const moods = await Mood.find({ user: userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Mood.countDocuments({ user: userId });

  return {
    moods,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    },
  };
};

module.exports = {
  createMood,
  getUserMoods,
};