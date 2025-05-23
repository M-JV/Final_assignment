// routes/admin.js
const express                       = require('express');
const User                          = require('../models/User');
const Post                          = require('../models/Post');
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const router                        = express.Router();

// protect *all* admin routes
router.use(isAuthenticated, isAdmin);

// ─── Admin Dashboard info ─────────────────────────────────────────────────────
router.get('/', (req, res) => {
  res.json({
    message: 'Welcome, admin',
    user: { id: req.user.id, username: req.user.username }
  });
});

// ─── List Users ────────────────────────────────────────────────────────────────
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// ─── Delete Any User ───────────────────────────────────────────────────────────
router.delete('/users/:id', async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete yourself' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ message: 'Error deleting user' });
  }
});

// ─── List Posts ────────────────────────────────────────────────────────────────
router.get('/posts', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error('Error fetching posts:', err);
    res.status(500).json({ message: 'Error fetching posts' });
  }
});

// ─── Delete Any Post ───────────────────────────────────────────────────────────
router.delete('/posts/:id', async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted' });
  } catch (err) {
    console.error('Error deleting post:', err);
    res.status(500).json({ message: 'Error deleting post' });
  }
});

module.exports = router;
