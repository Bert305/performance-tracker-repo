const blacklist = [];  // A simple array to store blacklisted tokens (in-memory)

// Logout controller
exports.logout = (req, res) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    // Add the token to the blacklist (this could be a database in a production system)
    blacklist.push(token);

    res.json({ message: 'Successfully logged out' });
};

// Middleware to check if token is blacklisted
exports.checkBlacklist = (req, res, next) => {
    const token = req.header('Authorization');

    if (blacklist.includes(token)) {
        return res.status(401).json({ message: 'Token has been invalidated' });
    }

    next();  // If token is not blacklisted, proceed with the request
};
