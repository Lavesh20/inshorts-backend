const jwt = require("jsonwebtoken");

const authenticateAdmin = (req, res, next) => {
    const token = req.header("Authorization");

    if (!token) {
        return res.status(401).json({ message: "Access Denied. No token provided." });
    }

    try {
        // Extract Bearer token
        const tokenValue = token.replace("Bearer ", "");
        const verified = jwt.verify(tokenValue, process.env.JWT_SECRET);

        req.admin = verified; // Store admin info in request
        next();
    } catch (err) {
        res.status(403).json({ message: "Invalid Token" });
    }
};

module.exports = authenticateAdmin;
