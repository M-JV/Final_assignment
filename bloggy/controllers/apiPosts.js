// controllers/apiPosts.js
const express            = require('express');
const Post               = require('../models/Post');
const User               = require('../models/User');
const { postValidation } = require('./validation');
const router             = express.Router();

// simple auth guard
function ensureLoggedIn(req, res, next) {
  if (req.user) return next();
  res.status(401).json({ message: 'Unauthorized' });
}

// — List, Search & By‐Author — GET /api/posts
// GET /api/posts?search=…&author=…
router.get('/posts', async (req, res) => {
  try {
    const { search, author } = req.query;
    const filter = {};

    // filter by author ID
    if (author) {
      filter.createdBy = author;
    }

    // full-text search on title/content/tags + author name
    if (search) {
      const re = new RegExp(search, 'i');
      // find matching authors
      const matching = await User.find({ username: re }).select('_id');
      const authorIds = matching.map(u => u._id);
      filter.$or = [
        { title: re },
        { content: re },
        { tags: re },
        { createdBy: { $in: authorIds } }
      ];
    }

    const posts = await Post.find(filter)
      .sort('-createdAt')
      .populate('createdBy', 'username');
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// — Fetch One — GET /api/posts/:id
router.get('/posts/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('createdBy', 'username');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    console.error('Error in GET /api/posts/:id:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// — Create — POST /api/posts
router.post('/posts', ensureLoggedIn, async (req, res) => {
  const { error } = postValidation.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const { title, content, tags = [] } = req.body;
    const post = new Post({
      title,
      content,
      tags,
      createdBy: req.user._id
    });
    await post.save();
    await post.populate('createdBy', 'username');
    res.status(201).json(post);
  } catch (err) {
    console.error('Error in POST /api/posts:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// — Update — PUT /api/posts/:id
router.put('/posts/:id', ensureLoggedIn, async (req, res) => {
  const { error } = postValidation.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (!post.createdBy.equals(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    post.title   = req.body.title;
    post.content = req.body.content;
    post.tags    = req.body.tags || [];
    await post.save();
    await post.populate('createdBy', 'username');
    res.json(post);
  } catch (err) {
    console.error('Error in PUT /api/posts/:id:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// — Delete — DELETE /api/posts/:id
router.delete('/posts/:id', ensureLoggedIn, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post)   return res.status(404).json({ message: 'Post not found' });
    const isOwner = post.createdBy.equals(req.user._id);
    if (!isOwner && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    await post.deleteOne();
    res.json({ message: 'Post deleted' });
  } catch (err) {
    console.error('Error in DELETE /api/posts/:id:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
