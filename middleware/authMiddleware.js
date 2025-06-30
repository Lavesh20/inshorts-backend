const jwt = require("jsonwebtoken");

const authenticateAdmin = (req, res, next) => {
    const token = req.header("Authorization");

    if (!token) {
        return res.status(401).json({ message: "Access Denied. No token provided." });
    }

    try {
        const tokenValue = token.replace("Bearer ", "");
        const verified = jwt.verify(tokenValue, process.env.JWT_SECRET);

        // ✅ Check if the user is admin
        if (!verified.isAdmin) {
            return res.status(403).json({ message: "Access Denied. Not an admin." });
        }

        req.admin = verified; // Save admin data if needed
        next();
    } catch (err) {
        res.status(403).json({ message: "Invalid Token" });
    }
};

module.exports = authenticateAdmin;