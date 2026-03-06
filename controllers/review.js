const Review = require("../models/review");

/* ---------------- GET all reviews ---------------- */

exports.getAllReviews = async (req, res) => {
  try {

    const reviews = await Review
      .find()
      .populate("user", "_id role")
      .sort({ _id: -1 });

    res.render("review", { reviews });

  } catch (err) {
    console.log(err);
    res.status(500).send("Server error");
  }
};


/* ---------------- CREATE review ---------------- */

exports.createReview = async (req, res) => {
  try {

    const { name, rating, message } = req.body;

    await Review.create({
      name,
      rating,
      message,
      user: req.user._id
    });

    res.redirect("/review");

  } catch (err) {
    console.log(err);
    res.status(500).send("Server error");
  }
};


/* ---------------- DELETE review ---------------- */

exports.deleteReview = async (req, res) => {
  try {

    await Review.findByIdAndDelete(req.params.id);

    res.redirect("/review");

  } catch (err) {
    console.log(err);
    res.status(500).send("Server error");
  }
};


/* ---------------- UPDATE review ---------------- */

exports.updateReview = async (req, res) => {
  try {

    const { message, rating } = req.body;

    await Review.findByIdAndUpdate(
      req.params.id,
      { message, rating },
      { runValidators: true }
    );

    res.redirect("/review");

  } catch (err) {
    console.log(err);
    res.status(500).send("Server error");
  }
};