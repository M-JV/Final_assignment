// routes/posts.js
const express               = require('express');
const mongoose              = require('mongoose');
const Post                  = require('../models/Post');
const { postValidation }    = require('../controllers/validation');
const { isAuthenticated }   = require('../middleware/auth');
const checkPostOwnership    = require('../middleware/checkPostOwnership'); // <— correct import
const router                = express.Router();

// ─── List & Search ───────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  const q = req.query.search;
  const filter = q
    ? {
        $or: [
          { title: { $regex: q, $options: 'i' } },
          { tags:  { $regex: q, $options: 'i' } }
        ]
      }
    : {};

  try {
    const posts = await Post.find(filter)
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error('Error fetching posts:', err);
    res.status(500).json({ message: 'Error fetching posts' });
  }
});

// ─── My Posts ─────────────────────────────────────────────────────────────────
router.get('/user/:userId', isAuthenticated, async (req, res) => {
  if (req.params.userId !== req.user.id) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  try {
    const posts = await Post.find({ createdBy: req.user.id })
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error('Error fetching your posts:', err);
    res.status(500).json({ message: 'Error fetching your posts' });
  }
});

// ─── Fetch for Edit ────────────────────────────────────────────────────────────
router.get('/:id/edit',
  isAuthenticated,
  checkPostOwnership,              // <— use checkPostOwnership here
  (req, res) => {
    res.json(req.post);
  }
);

// ─── Get Single Post ───────────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid post ID' });
  }
  try {
    const post = await Post.findById(id)
      .populate('createdBy', 'username');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    console.error('Error fetching post:', err);
    res.status(500).json({ message: 'Error fetching post' });
  }
});

// ─── Create Post ───────────────────────────────────────────────────────────────
router.post('/',
  isAuthenticated,
  async (req, res) => {
    const { title, content, tags } = req.body;
    const { error } = postValidation.validate({ title, content });
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const processedTags = Array.isArray(tags)
      ? tags.map(t => t.trim().toLowerCase()).filter(Boolean)
      : [];
    try {
      const post = new Post({
        title,
        content,
        tags: processedTags,
        createdBy: req.user.id
      });
      await post.save();
      res.status(201).json(post);
    } catch (err) {
      console.error('Error creating post:', err);
      res.status(500).json({ message: 'Error creating post' });
    }
  }
);

// ─── Update Post ───────────────────────────────────────────────────────────────
router.put('/:id',
  isAuthenticated,
  checkPostOwnership,              // <— and here
  async (req, res) => {
    const { title, content, tags } = req.body;
    const { error } = postValidation.validate({ title, content });
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    req.post.title   = title;
    req.post.content = content;
    req.post.tags    = Array.isArray(tags)
      ? tags.map(t => t.trim().toLowerCase()).filter(Boolean)
      : [];

    try {
      await req.post.save();
      res.json(req.post);
    } catch (err) {
      console.error('Error updating post:', err);
      res.status(500).json({ message: 'Error updating post' });
    }
  }
);

// ─── Delete Post ───────────────────────────────────────────────────────────────
router.delete('/:id',
  isAuthenticated,
  checkPostOwnership,              // <— and here
  async (req, res) => {
    try {
      await req.post.deleteOne();
      res.json({ message: 'Post deleted' });
    } catch (err) {
      console.error('Error deleting post:', err);
      res.status(500).json({ message: 'Error deleting post' });
    }
  }
);

module.exports = router;
