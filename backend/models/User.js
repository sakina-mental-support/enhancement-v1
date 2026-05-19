const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    emergencyContact: {
      name: {
        type: String,
      },
      phone: {
        type: String,
      },
      relation: {
        type: String,
      },
    },

    isHighRisk: {
      type: Boolean,
      default: false,
    },
    avatar: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true, // بيعمل createdAt و updatedAt تلقائي
  }
);

module.exports = mongoose.model("User", userSchema);