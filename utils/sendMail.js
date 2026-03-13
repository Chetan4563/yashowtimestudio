const nodemailer = require("nodemailer");

console.log("📧 MAIL_USER:", process.env.MAIL_USER || "❌ MISSING");
console.log("🔑 MAIL_PASS:", process.env.MAIL_PASS ? "✅ Set (" + process.env.MAIL_PASS.length + " chars)" : "❌ MISSING");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  },
  tls: { rejectUnauthorized: false }
});

exports.sendOTP = async (to, otp) => {
  try {
    console.log("📤 Sending OTP to:", to);
    const info = await transporter.sendMail({
      from: process.env.MAIL_USER,
      to,
      subject: "Your OTP - Ya.Showtime Studio",
      text: `Your OTP is: ${otp}\n\nThis OTP expires in 5 minutes.`
    });
    console.log("✅ OTP sent successfully:", info.response);
  } catch (err) {
    console.error("❌ OTP SEND FAILED:", err.message);
    console.error("❌ FULL ERROR:", err);
    throw err;
  }
};