const express = require("express");
const router = express.Router();

const isLoggedIn = require("../middlewares/isLoggedIn");
const isReviewOwnerOrAdmin = require("../middlewares/isReviewOwnerOrAdmin");

const reviewController = require("../controllers/review");

/* ---------------- GET all reviews ---------------- */
router.get("/review", reviewController.getAllReviews);

/* ---------------- CREATE review ---------------- */
router.post("/review", isLoggedIn, reviewController.createReview);

/* ---------------- DELETE review ---------------- */
router.post(
  "/review/:id/delete",
  isLoggedIn,
  isReviewOwnerOrAdmin,
  reviewController.deleteReview
);

/* ---------------- UPDATE review ---------------- */
router.post(
  "/review/:id/update",
  isLoggedIn,
  isReviewOwnerOrAdmin,
  reviewController.updateReview
);

module.exports = router;