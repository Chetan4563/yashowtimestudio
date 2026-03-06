const Lead = require("../models/contact");


exports.createContact = async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;

        await Lead.create({
            name,
            email,
            phone,
            message
        });

        res.redirect("/contact");

    } catch (err) {
        console.log(err);
        res.status(500).send("Server error");
    }
};