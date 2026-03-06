const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({

  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    minlength: [2, "Name must be at least 2 characters"],
    maxlength: [50, "Name cannot exceed 50 characters"]
  },

  message: {
    type: String,
    required: [true, "Review message is required"],
    trim: true,
    minlength: [10, "Review must be at least 10 characters"],
    maxlength: [500, "Review cannot exceed 500 characters"]
  },

  rating: {
    type: Number,
    required: [true, "Rating is required"],
    min: [1, "Rating must be at least 1"],
    max: [5, "Rating cannot be more than 5"]
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User reference is required"]
  }

}, { timestamps: true });

module.exports = mongoose.model("Review", reviewSchema);