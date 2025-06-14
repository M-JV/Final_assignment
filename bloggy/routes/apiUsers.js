const express = require('express');
const User    = require('../models/User');
const { isAuthenticated } = require('../middleware/auth');
const router  = express.Router();

// — GET /api/users/online — list all user-IDs currently connected
router.get('/online', (req, res) => {
  const onlineUsers = req.app.get('onlineUsers');
  res.json(Array.from(onlineUsers));
});

// — GET /api/users — list all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('_id username');
    res.json(users);
  } catch (err) {
    console.error('Error fetching users list:', err);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// — GET /api/users/:id — one user’s public info
router.get('/:id', async (req, res) => {
  try {
    const u = await User.findById(req.params.id).select('_id username');
    if (!u) return res.status(404).json({ message: 'User not found' });
    res.json(u);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ message: 'Error fetching user' });
  }
});

// — GET /api/users/:id/isSubscribed — am I following them?
router.get('/:id/isSubscribed', isAuthenticated, async (req, res) => {
  try {
    const me = await User.findById(req.user.id).select('following');
    const isSubscribed = me.following
      .map(id => id.toString())
      .includes(req.params.id);
    res.json({ isSubscribed });
  } catch (err) {
    console.error('Error checking subscribe status:', err);
    res.status(500).json({ message: 'Error checking status' });
  }
});

// — POST /api/users/:id/follow
router.post('/:id/follow', isAuthenticated, async (req, res) => {
  const meId     = req.user.id;
  const targetId = req.params.id;
  if (meId === targetId) {
    return res.status(400).json({ message: "Can't follow yourself." });
  }
  try {
    await User.findByIdAndUpdate(meId, {
      $addToSet: { following: targetId }
    });
    res.json({ message: 'Subscribed' });
  } catch (err) {
    console.error('Error subscribing:', err);
    res.status(500).json({ message: 'Error subscribing' });
  }
});

// — POST /api/users/:id/unfollow
router.post('/:id/unfollow', isAuthenticated, async (req, res) => {
  const meId     = req.user.id;
  const targetId = req.params.id;
  try {
    await User.findByIdAndUpdate(meId, {
      $pull: { following: targetId }
    });
    res.json({ message: 'Unsubscribed' });
  } catch (err) {
    console.error('Error unsubscribing:', err);
    res.status(500).json({ message: 'Error unsubscribing' });
  }
});

// — NEW: GET /api/users/me/following — authors I’m subscribed to
router.get('/me/following', isAuthenticated, async (req, res, next) => {
  try {
    const me = await User.findById(req.user.id)
      .select('following')
      .populate('following', '_id username');
    res.json(me.following);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
