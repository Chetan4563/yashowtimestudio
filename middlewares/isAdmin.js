module.exports = function isAdmin(req, res, next) {

    if (!req.session || !req.session.user) {
        return res.redirect("/signin");
    }

    // make user available
    req.user = req.session.user;

    if (req.user.role === "admin") {
        return next();
    }

    return res.status(403).send("You are not admin");
};