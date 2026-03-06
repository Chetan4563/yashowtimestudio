const Otp    = require("../models/otp");
const User   = require("../models/user");
const { sendOTP } = require("../utils/sendMail");
const bcrypt = require("bcrypt");

/* ─────────────────────────────────────────────
   STRONG PASSWORD HELPER
───────────────────────────────────────────── */
function isStrongPassword(password) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(password);
}

/* ─────────────────────────────────────────────
   PAGES
───────────────────────────────────────────── */
exports.getSignup = (req, res) => {
  delete req.session.otpData;
  delete req.session.forgotOtpData;           // FIX: clear forgot session too on fresh signup
  res.render("signup", { step: 1 });
};

exports.getSignin = (req, res) => res.render("signin");

exports.getForgotPassword = (req, res) => {
  delete req.session.forgotOtpData;           // FIX: clear any stale forgot session on page load
  res.render("forgot-password", { step: 1 });
};

/* ─────────────────────────────────────────────
   SIGNUP STEP 1 → STEP 2  |  POST /send-otp
───────────────────────────────────────────── */
exports.sendSignupOtp = async (req, res) => {
  const { name, login } = req.body;

  // Show validation errors from middleware
  if (req.validationErrors) {
    return res.render("signup", {
      step: 1,
      signupError: req.validationErrors[0],
      formData: { name, login }
    });
  }

  const email = login.trim().toLowerCase();

  try {
    const already = await User.findOne({ email });
    if (already) {
      return res.render("signup", {
        step: 1,
        signupError: "This email is already registered.",
        formData: { name, login }
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await Otp.deleteMany({ email });
    await Otp.create({ email, otp, expiresAt: new Date(Date.now() + 5 * 60 * 1000) });

    req.session.otpData = { name, login: email, verified: false };
    await sendOTP(email, otp);

    return res.render("signup", {
      step: 2,
      formData: { name, login: email },
      otpMsg: `OTP sent to ${email}`
    });

  } catch (err) {
    console.error("sendSignupOtp error:", err);
    return res.render("signup", {
      step: 1,
      signupError: "Failed to send OTP. Please try again.",
      formData: { name, login }
    });
  }
};

/* ─────────────────────────────────────────────
   SIGNUP STEP 2 → STEP 3  |  POST /verify-otp
───────────────────────────────────────────── */
exports.verifyOtp = async (req, res) => {
  const { name, login } = req.body;
  const email = (login || "").trim().toLowerCase();

  // Single OTP input — strip non-digits just in case
  const otp = (req.body.otp || '').trim().replace(/\D/g, '');

  if (otp.length < 6) {
    return res.render("signup", {
      step: 2,
      signupError: "Please enter all 6 digits of your OTP.",
      formData: { name, login: email }
    });
  }

  if (!email) {
    return res.render("signup", {
      step: 1,
      signupError: "Session lost. Please start again."
    });
  }

  try {
    const record = await Otp.findOne({ email, otp });

    if (!record) {
      return res.render("signup", {
        step: 2,
        signupError: "Incorrect OTP. Please check and try again.",
        formData: { name, login: email }
      });
    }

    if (record.expiresAt < new Date()) {
      await Otp.deleteMany({ email });
      return res.render("signup", {
        step: 2,
        signupError: "OTP has expired. Please request a new one.",
        formData: { name, login: email }
      });
    }

    req.session.otpData = { name, login: email, verified: true };

    return res.render("signup", {
      step: 3,
      formData: { name, login: email },
      otpMsg: "OTP verified! Now set your password."
    });

  } catch (err) {
    console.error("verifyOtp error:", err);
    return res.render("signup", {
      step: 2,
      signupError: "Something went wrong. Please try again.",
      formData: { name, login: email }
    });
  }
};

/* ─────────────────────────────────────────────
   SIGNUP STEP 3 → DONE  |  POST /signup
───────────────────────────────────────────── */
exports.signup = async (req, res) => {
  const { name, login, password, confirmPassword } = req.body;
  const email   = (login || "").trim().toLowerCase();
  const session = req.session.otpData;

  if (!session || !session.verified) {
    return res.render("signup", {
      step: 1,
      signupError: "Please verify your OTP first."
    });
  }

  if (session.login !== email) {
    return res.render("signup", {
      step: 1,
      signupError: "Session mismatch. Please start again."
    });
  }

  // Show validation errors from middleware
  if (req.validationErrors) {
    return res.render("signup", {
      step: 3,
      signupError: req.validationErrors[0],
      formData: { name, login: email }
    });
  }

  if (password !== confirmPassword) {
    return res.render("signup", {
      step: 3,
      signupError: "Passwords do not match.",
      formData: { name, login: email }
    });
  }

  if (!isStrongPassword(password)) {
    return res.render("signup", {
      step: 3,
      signupError: "Password must be 8+ characters with uppercase, lowercase, number and special character.",
      formData: { name, login: email }
    });
  }

  try {
    const already = await User.findOne({ email });
    if (already) {
      await Otp.deleteMany({ email });
      delete req.session.otpData;
      return res.render("signup", {
        step: 1,
        signupError: "This email is already registered."
      });
    }

    const hash = await bcrypt.hash(password, 10);
    const user  = await User.create({
      name:     name || session.name,
      email,
      password: hash,
      role:     "user"
    });

    await Otp.deleteMany({ email });
    delete req.session.otpData;

    req.session.user = { _id: user._id, name: user.name, email: user.email, role: user.role };
    req.user = req.session.user;

    return res.redirect("/");

  } catch (err) {
    console.error("signup error:", err);
    return res.render("signup", {
      step: 3,
      signupError: "Failed to create account. Please try again.",
      formData: { name, login: email }
    });
  }
};

/* ─────────────────────────────────────────────
   SIGNIN  |  POST /signin
───────────────────────────────────────────── */
exports.signin = async (req, res) => {
  const { login, password } = req.body;

  if (req.validationErrors) {
    return res.render("signin", { signinError: req.validationErrors[0] });
  }

  const email = login.trim().toLowerCase();

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.render("signin", { signinError: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.render("signin", { signinError: "Invalid email or password." });
    }

    req.session.user = { _id: user._id, name: user.name, email: user.email, role: user.role };
    req.user = req.session.user;

    return res.redirect("/");

  } catch (err) {
    console.error("signin error:", err);
    return res.render("signin", { signinError: "Something went wrong." });
  }
};

/* ─────────────────────────────────────────────
   FORGOT STEP 1 → STEP 2  |  POST /send-otp/forgot-password
   FIX: was /send-forgot-otp — updated to match EJS action
   FIX: now passes formData.email so EJS savedEmail works
───────────────────────────────────────────── */
exports.sendForgotOtp = async (req, res) => {
  const { email } = req.body;

  if (req.validationErrors) {
    return res.render("forgot-password", {
      step: 1,
      error: req.validationErrors[0]
    });
  }

  const cleanEmail = email.trim().toLowerCase();

  try {
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.render("forgot-password", {
        step: 1,
        error: "No account found with this email."
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await Otp.deleteMany({ email: cleanEmail });
    await Otp.create({ email: cleanEmail, otp, expiresAt: new Date(Date.now() + 5 * 60 * 1000) });

    // FIX: store email in session so step 2 and 3 can access it
    req.session.forgotOtpData = { email: cleanEmail, verified: false };
    await sendOTP(cleanEmail, otp);

    return res.render("forgot-password", {
      step: 2,                              // FIX: was showOtp:true — now uses step number like signup
      formData: { email: cleanEmail },      // FIX: EJS reads savedEmail from formData.email
      otpMsg: `OTP sent to ${cleanEmail}`
    });

  } catch (err) {
    console.error("sendForgotOtp error:", err);
    return res.render("forgot-password", {
      step: 1,
      error: "Failed to send OTP. Please try again."
    });
  }
};

/* ─────────────────────────────────────────────
   FORGOT STEP 2 → STEP 3  |  POST /verify-otp/forgot-password
   FIX: this entire method was missing from the controller
───────────────────────────────────────────── */
exports.verifyForgotOtp = async (req, res) => {
  const { email } = req.body;
  const cleanEmail = (email || "").trim().toLowerCase();

  // Single OTP input — strip non-digits just in case
  const otp = (req.body.otp || '').trim().replace(/\D/g, '');

  if (otp.length < 6) {
    return res.render("forgot-password", {
      step: 2,
      error: "Please enter all 6 digits of your OTP.",
      formData: { email: cleanEmail }
    });
  }

  if (!cleanEmail) {
    return res.render("forgot-password", {
      step: 1,
      error: "Session lost. Please start again."
    });
  }

  try {
    const record = await Otp.findOne({ email: cleanEmail, otp });

    if (!record) {
      return res.render("forgot-password", {
        step: 2,
        error: "Incorrect OTP. Please check and try again.",
        formData: { email: cleanEmail }
      });
    }

    if (record.expiresAt < new Date()) {
      await Otp.deleteMany({ email: cleanEmail });
      return res.render("forgot-password", {
        step: 2,
        error: "OTP has expired. Please request a new one.",
        formData: { email: cleanEmail }
      });
    }

    // ✓ OTP correct — mark verified in session
    req.session.forgotOtpData = { email: cleanEmail, verified: true };

    return res.render("forgot-password", {
      step: 3,
      formData: { email: cleanEmail },
      otpMsg: "OTP verified! Now set your new password."
    });

  } catch (err) {
    console.error("verifyForgotOtp error:", err);
    return res.render("forgot-password", {
      step: 2,
      error: "Something went wrong. Please try again.",
      formData: { email: cleanEmail }
    });
  }
};

/* ─────────────────────────────────────────────
   FORGOT STEP 3 → DONE  |  POST /forgot-password/reset
   FIX: was /forgot-password — updated to match EJS action
   FIX: no longer accepts OTP in body — OTP was verified in step 2
   FIX: validates session.forgotOtpData.verified before resetting
───────────────────────────────────────────── */
exports.forgotPassword = async (req, res) => {
  const { email, password, confirmPassword } = req.body;
  const cleanEmail = (email || "").trim().toLowerCase();
  const session    = req.session.forgotOtpData;

  // Guard: must have completed step 2
  if (!session || !session.verified || session.email !== cleanEmail) {
    return res.render("forgot-password", {
      step: 1,
      error: "Session expired or invalid. Please start again."
    });
  }

  if (req.validationErrors) {
    return res.render("forgot-password", {
      step: 3,
      error: req.validationErrors[0],
      formData: { email: cleanEmail }
    });
  }

  if (password !== confirmPassword) {
    return res.render("forgot-password", {
      step: 3,
      error: "Passwords do not match.",
      formData: { email: cleanEmail }
    });
  }

  if (!isStrongPassword(password)) {
    return res.render("forgot-password", {
      step: 3,
      error: "Password must be 8+ characters with uppercase, lowercase, number and special character.",
      formData: { email: cleanEmail }
    });
  }

  try {
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.render("forgot-password", {
        step: 1,
        error: "No account found with this email."
      });
    }

    const hash = await bcrypt.hash(password, 10);
    await User.updateOne({ email: cleanEmail }, { $set: { password: hash } });
    await Otp.deleteMany({ email: cleanEmail });
    delete req.session.forgotOtpData;

    // FIX: render with step:1 and success so user can go sign in cleanly
    return res.render("forgot-password", {
      step: 1,
      success: "Password changed successfully! You can now sign in."
    });

  } catch (err) {
    console.error("forgotPassword error:", err);
    return res.render("forgot-password", {
      step: 3,
      error: "Something went wrong. Please try again.",
      formData: { email: cleanEmail }
    });
  }
};

/* ─────────────────────────────────────────────
   GOOGLE CALLBACK
───────────────────────────────────────────── */
exports.googleSuccess = (req, res) => {
  const user = req.user;
  if (!user) return res.redirect("/signin");

  req.session.user = { _id: user._id, name: user.name, email: user.email, role: user.role };
  res.redirect("/");
};

/* ─────────────────────────────────────────────
   LOGOUT
───────────────────────────────────────────── */
exports.logout = (req, res) => {
  req.session.destroy(err => {
    if (err) console.error("logout error:", err);
    res.redirect("/");
  });
};
