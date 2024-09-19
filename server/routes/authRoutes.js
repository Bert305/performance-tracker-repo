const express = require('express');
const router = express.Router();
const { logout, checkBlacklist } = require('../controllers/logoutController');

// Protect routes using the checkBlacklist middleware to ensure invalidated tokens are blocked
router.post('/logout', checkBlacklist, logout);

module.exports = router;
