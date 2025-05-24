// routes/apiUsers.js
const express = require('express');
const User    = require('../models/User');
const { isAuthenticated } = require('../middleware/auth');
const router  = express.Router();

// GET /api/users — list all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('_id username');
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// GET /api/users/:id — get one user’s public info
router.get('/:id', async (req, res) => {
  try {
    const u = await User.findById(req.params.id).select('_id username');
    if (!u) return res.status(404).json({ message: 'User not found' });
    res.json(u);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching user' });
  }
});

// GET /api/users/:id/isSubscribed — am I following them?
router.get('/:id/isSubscribed', isAuthenticated, async (req, res) => {
  try {
    const me = await User.findById(req.user._id);
    const isSubscribed = me.following.includes(req.params.id);
    res.json({ isSubscribed });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error checking status' });
  }
});

// POST /api/users/:id/follow
router.post('/:id/follow', isAuthenticated, async (req, res) => {
  if (req.user._id.equals(req.params.id)) {
    return res.status(400).json({ message: "Can't follow yourself." });
  }
  try {
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { following: req.params.id }
    });
    res.json({ message: 'Subscribed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error subscribing' });
  }
});

// POST /api/users/:id/unfollow
router.post('/:id/unfollow', isAuthenticated, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { following: req.params.id }
    });
    res.json({ message: 'Unsubscribed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error unsubscribing' });
  }
});

module.exports = router;
