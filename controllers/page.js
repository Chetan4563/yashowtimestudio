const Lead = require("../models/contact");

exports.createContact = async (req, res) => {
  try {
    const { name, email, phone, message, service, projectType } = req.body;

    await Lead.create({ name, email, phone, message, service, projectType });

    res.status(200).json({ message: "Message sent successfully" }); // ← changed from res.redirect

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error. Please try again." }); // ← changed from res.send
  }
};