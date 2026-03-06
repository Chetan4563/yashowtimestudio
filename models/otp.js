const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
{
  email: {
    type: String,
    required: [true, "Email is required"],
    lowercase: true,
    trim: true,
    index: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      "Please enter a valid email address"
    ]
  },

  otp: {
    type: String,
    required: [true, "OTP is required"],
    match: [/^[0-9]{6}$/, "OTP must be a 6 digit number"]
  },

  expiresAt: {
    type: Date,
    required: [true, "Expiry time is required"]
  }

},
{ timestamps: true }
);

/* Auto delete OTP after expiry */
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Otp", otpSchema);