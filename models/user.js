const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    minlength: [2, "Name must be at least 2 characters"],
    maxlength: [50, "Name cannot exceed 50 characters"]
  },

  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      "Please enter a valid email address"
    ]
  },

  password: {
    type: String,
    minlength: [6, "Password must be at least 6 characters"]
  },

  googleId: {
    type: String
  },

  otp: {
    type: String,
    match: [/^[0-9]{6}$/, "OTP must be a 6 digit number"]
  },

  otpExpire: {
    type: Date
  },

  isVerified: {
    type: Boolean,
    default: false
  },

  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user"
  }

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);