const Contact = require("../models/contact");

module.exports.showContactsPage = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });

    res.render("info", { contacts });

  } catch (err) {
    console.log(err);
    res.status(500).send("Server error");
  }
};

module.exports.removeContact = async (req, res) => {
  await Contact.findByIdAndDelete(req.params.id);
  res.redirect('/admin/contacts');
};
