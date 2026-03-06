const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({

  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    minlength: [3, "Name must be at least 3 characters"],
    maxlength: [50, "Name cannot exceed 50 characters"]
  },

  phone: {
    type: String,
    required: [true, "Phone number is required"],
    match: [/^[0-9]{10}$/, "Phone number must be 10 digits"]
  },

  email: {
    type: String,
    required: [true, "Email is required"],
    trim: true,
    lowercase: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      "Please enter a valid email address"
    ]
  },

  service: {
    type: String,
    required: [true, "Service is required"],
    trim: true
  },

  projectType: {
    type: String,
    required: [true, "Project type is required"],
    trim: true
  },

  message: {
    type: String,
    required: [true, "Message is required"],
    minlength: [10, "Message must be at least 10 characters"],
    maxlength: [500, "Message cannot exceed 500 characters"]
  },

  createdAt: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model("Contact", contactSchema);