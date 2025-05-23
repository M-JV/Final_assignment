// routes/apiUsers.js
const express = require('express');
const User    = require('../models/User');
const { isAuthenticated } = require('../middleware/auth');
const router  = express.Router();

// GET /api/users — list all users (no passwords!)
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('_id username');
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

module.exports = router;
