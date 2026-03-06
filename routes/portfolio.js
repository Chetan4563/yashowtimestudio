const express = require("express");
const router = express.Router();

const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const portfolioController = require("../controllers/portfolio");
const isAdmin = require("../middlewares/isAdmin");

router.get(
  "/portfolio",
  portfolioController.getPortfolioPage
);

router.post(
  "/portfolio/add",
  isAdmin,
  upload.single("media"),
  portfolioController.addPortfolioWork
);

router.post(
  "/portfolio/delete/:id",
  isAdmin,
  portfolioController.deletePortfolioWork
);

module.exports = router;