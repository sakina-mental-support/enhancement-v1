const mongoose = require("mongoose");
require("dotenv").config({ path: "../.env" });
const Exercise = require("../models/Exercise");

const clearSeeded = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB...");
    
    const result = await Exercise.deleteMany({
      title: { 
        $in: [
          "5-4-3-2-1 Grounding", 
          "Cognitive Reframing", 
          "Progressive Muscle Relaxation", 
          "Box Breathing"
        ] 
      }
    });
    
    console.log(`Deleted ${result.deletedCount} seeded database exercises successfully! ✅`);
    process.exit(0);
  } catch (err) {
    console.error("Error clearing database:", err);
    process.exit(1);
  }
};

clearSeeded();
