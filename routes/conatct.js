const express = require("express");
const router = express.Router();

const contactController = require("../controllers/contact");
const isAdmin = require("../middlewares/isAdmin");

router.get(
  "/admin/contacts", isAdmin, contactController.showContactsPage
);

router.post('/admin/contacts/:id/delete', isAdmin, contactController.removeContact);

module.exports = router;