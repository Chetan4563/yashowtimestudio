const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema({

  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    minlength: [3, "Name must be at least 3 characters"],
    maxlength: [50, "Name cannot exceed 50 characters"]
  },

  email: {
    type: String,
    required: [true, "Email is required"],
    lowercase: true,
    trim: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      "Please enter a valid email address"
    ]
  },

  phone: {
    type: String,
    required: [true, "Phone number is required"],
    match: [/^[0-9]{10}$/, "Phone number must be 10 digits"]
  },

  service: {
    type: String,
    required: [true, "Service is required"],
    trim: true,
    enum: [
      "Web Development",
      "App Development",
      "UI/UX Design",
      "SEO",
      "Digital Marketing"
    ]
  },

  message: {
    type: String,
    required: [true, "Message is required"],
    minlength: [10, "Message must be at least 10 characters"],
    maxlength: [500, "Message cannot exceed 500 characters"],
    trim: true
  }

}, { timestamps: true });

module.exports = mongoose.model("Lead", leadSchema);