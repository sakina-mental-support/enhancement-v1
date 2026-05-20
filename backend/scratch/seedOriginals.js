const mongoose = require("mongoose");
require("dotenv").config({ path: "../.env" });
const Exercise = require("../models/Exercise");

const originalShifts = [
  {
    title: "Deep Peace",
    description: "Quiet the noise in your mind.",
    duration: "10",
    imageUrl: "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=800&q=80",
    category: "Nervous System",
    content: "Step 1: Neural Scan - Locate the static in your nervous system.\nStep 2: Fluid Breath - Sync your lungs with the ocean current.\nStep 3: Blue Lock - Anchor your eyes on the deep teal light.\nStep 4: Dissolve - Let your thoughts become water."
  },
  {
    title: "Somatic Earth",
    description: "Move your body to feel light.",
    duration: "15",
    imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80",
    category: "Emotional Release",
    content: "Step 1: Tension Map - Press your feet down. Feel the earth push back.\nStep 2: Muscle Release - Release the heavy weight in your shoulders.\nStep 3: Earth Pulse - Sync your heartbeat with the forest floor.\nStep 4: Rooted - You are part of the earth now. Feel the power."
  },
  {
    title: "Clarity Chamber",
    description: "Clear the fog and see better.",
    duration: "10",
    imageUrl: "https://images.unsplash.com/photo-1499209974431-9dac3adaf471?auto=format&fit=crop&w=800&q=80",
    category: "Cognitive",
    content: "Step 1: Fog Removal - The brain fog is temporary. Watch it dissolve.\nStep 2: Object Lock - Lock your mind onto a single point of light.\nStep 3: Pulse Sync - Fire your neurons in a clean, straight line.\nStep 4: Clear Vision - The path is now clear. Ready to act?"
  },
  {
    title: "Neural Shelter",
    description: "Find safety right now.",
    duration: "5",
    imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80",
    category: "Emergency",
    content: "Step 1: Wall Lock - Touch the nearest wall. It is solid. It is safe.\nStep 2: Rate Stabilize - The storm is outside. You are inside the shield.\nStep 3: Shield Breath - Breathe the thick, clean air of the shelter.\nStep 4: Shelter Lock - Stay here as long as you need. You are home."
  }
];

const seedOriginals = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB...");
    
    // Add the 4 original shifts into database if they are not already there
    for (const shift of originalShifts) {
      const exists = await Exercise.findOne({ title: shift.title });
      if (!exists) {
        await Exercise.create(shift);
        console.log(`Seeded: ${shift.title}`);
      } else {
        console.log(`Already exists: ${shift.title}`);
      }
    }
    
    console.log("Original shifts seeding task completed! ✅");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding original shifts:", err);
    process.exit(1);
  }
};

seedOriginals();
