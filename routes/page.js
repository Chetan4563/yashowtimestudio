const express = require("express");
const router = express.Router();

const { createContact } = require("../controllers/page");
const isLoggedIn = require("../middlewares/isLoggedIn");

// Pages
router.get("/", (req, res) => {
    res.render("home", { title: "Home" });
});

router.get("/about", (req, res) => {
    res.render("about", { title: "About" });
});

router.get("/services", (req, res) => {
    res.render("services", { title: "Services" });
});

router.get("/contact", (req, res) => {
    res.render("contact", { title: "Contact" });
});

// Contact form submit
router.post("/api/contact", isLoggedIn, createContact);

module.exports = router;