const router   = require("express").Router();
const passport = require("passport");
const rateLimit = require("express-rate-limit");
const { body, validationResult } = require("express-validator");

const authController = require("../controllers/auth");

/* ─────────────────────────────────────────────
   RATE LIMITERS
───────────────────────────────────────────── */
const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 3,
  message: "Too many OTP requests. Please wait 5 minutes and try again."
});

/* ─────────────────────────────────────────────
   VALIDATION RULES
───────────────────────────────────────────── */

// Signup Step 1 — name + email/login
const sendOtpValidation = [
  body("name").trim().notEmpty().withMessage("Name is required."),
  body("login").trim().notEmpty().withMessage("Email or mobile number is required.")
];

// Signup Step 3 — set password after OTP verified
const signupValidation = [
  body("password")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters.")
    .matches(/[A-Z]/).withMessage("Password must include an uppercase letter.")
    .matches(/[0-9]/).withMessage("Password must include a number.")
    .matches(/[^A-Za-z0-9]/).withMessage("Password must include a special character."),
  body("confirmPassword").notEmpty().withMessage("Please confirm your password.")
];

// Signin
const signinValidation = [
  body("login").trim().notEmpty().withMessage("Email is required."),
  body("password").notEmpty().withMessage("Password is required.")
];

// Forgot Step 1 — email only
const forgotSendOtpValidation = [
  body("email").isEmail().withMessage("A valid email is required.")
];

// Forgot Step 3 — new password only (OTP already verified in step 2)
const forgotResetValidation = [
  body("email").isEmail().withMessage("A valid email is required."),
  body("password")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters.")
    .matches(/[A-Z]/).withMessage("Password must include an uppercase letter.")
    .matches(/[0-9]/).withMessage("Password must include a number.")
    .matches(/[^A-Za-z0-9]/).withMessage("Password must include a special character."),
  body("confirmPassword").notEmpty().withMessage("Please confirm your password.")
];

/* ─────────────────────────────────────────────
   VALIDATION ERROR HANDLER
───────────────────────────────────────────── */
function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.validationErrors = errors.array().map(e => e.msg);
  }
  next();
}

/* ─────────────────────────────────────────────
   PAGE ROUTES (GET)
───────────────────────────────────────────── */
router.get("/signup",          authController.getSignup);
router.get("/signin",          authController.getSignin);
router.get("/forgot-password", authController.getForgotPassword);

/* ─────────────────────────────────────────────
   SIGNUP — 3-STEP FLOW
   EJS Step 1 → POST /send-otp
   EJS Step 2 → POST /verify-otp
   EJS Step 3 → POST /signup
───────────────────────────────────────────── */
router.post(
  "/send-otp",
  otpLimiter,
  sendOtpValidation,
  handleValidation,
  authController.sendSignupOtp
);

router.post(
  "/verify-otp",
  authController.verifyOtp
);

router.post(
  "/signup",
  signupValidation,
  handleValidation,
  authController.signup
);

/* ─────────────────────────────────────────────
   SIGNIN
───────────────────────────────────────────── */
router.post(
  "/signin",
  signinValidation,
  handleValidation,
  authController.signin
);

/* ─────────────────────────────────────────────
   FORGOT PASSWORD — 3-STEP FLOW
   EJS Step 1 → POST /send-otp/forgot-password
   EJS Step 2 → POST /verify-otp/forgot-password
   EJS Step 3 → POST /forgot-password/reset
───────────────────────────────────────────── */
router.post(
  "/send-otp/forgot-password",      // matches EJS step 1 action
  otpLimiter,
  forgotSendOtpValidation,
  handleValidation,
  authController.sendForgotOtp
);

router.post(
  "/verify-otp/forgot-password",    // matches EJS step 2 action
  authController.verifyForgotOtp
);

router.post(
  "/forgot-password/reset",         // matches EJS step 3 action
  forgotResetValidation,
  handleValidation,
  authController.forgotPassword
);

/* ─────────────────────────────────────────────
   GOOGLE OAUTH
───────────────────────────────────────────── */
router.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: true
  })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/signin" }),
  authController.googleSuccess
);

/* ─────────────────────────────────────────────
   LOGOUT
───────────────────────────────────────────── */
router.get("/logout", authController.logout);

module.exports = router;
