const mongoose = require("mongoose");
require("dotenv").config({ path: "../.env" });
const Exercise = require("../models/Exercise");

const list = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB...");
    const exercises = await Exercise.find({});
    console.log("All exercises in database:");
    exercises.forEach(e => console.log(`- ID: ${e._id}, Title: "${e.title}", Category: "${e.category}"`));
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
};

list();
