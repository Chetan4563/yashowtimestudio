const Review = require("../models/review");

module.exports = async function isReviewOwnerOrAdmin(req, res, next) {

  try {

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).send("Review not found");
    }

    // admin can do anything
    if (req.user.role === "admin") {
      return next();
    }

    // owner check
    if (review.user.toString() === req.user._id.toString()) {
      return next();
    }

    return res.status(403).send("You are not allowed");

  } catch (err) {
    console.log(err);
    return res.status(500).send("Server error");
  }
};