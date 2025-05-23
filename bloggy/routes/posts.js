// controller/posts.js


const express = require('express');
const mongoose = require('mongoose');
const Post = require('../models/Post');
const { postValidation } = require('../controllers/validation');
const { isAuthenticated } = require('../middleware/auth');
const checkPostOwnership = require('../middleware/checkPostOwnership');
const router = express.Router();


// Create Post Form
router.get('/posts/new', isAuthenticated, (req, res) => {
    res.render('new-post', { error: req.flash('error') });
});


// Create Post
router.post('/posts', isAuthenticated, async (req, res) => {
    const { title, content, tags } = req.body;

    // Validate only title and content
    const { error } = postValidation.validate({ title, content });
    if (error) {
        req.flash('error', error.details[0].message);
        return res.redirect('/posts/new');
    }

    // Process tags
    const processedTags = tags ? tags.split(',').map(tag => tag.trim().toLowerCase()) : [];

    // create and save posts
    try {
        const post = new Post({ title, content, createdBy: req.user._id, tags: processedTags });
        await post.save();
        req.flash('success', 'Post created');
        res.redirect('/posts');
    } catch (err) {
        console.error('Error creating post:', err);
        req.flash('error', 'Error creating post');
        res.redirect('/posts/new');
    }
});


// Search Posts
router.get('/search', async (req, res) => {
  const query = req.query.q;

  try {
    let searchQuery = {};
    if (query) {
      searchQuery = {
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { tags: { $regex: query, $options: 'i' } }
        ]
      };
    }

    const posts = await Post.find(searchQuery).populate('createdBy', 'username');
    res.render('posts', { posts, searchTerm: query }); // Use 'posts.pug' to display filtered posts
  } catch (err) {
    console.error('❌ Error searching posts:', err);
    req.flash('error', 'Error while searching.');
    res.redirect('/');
  }
});


// View All Posts (without search filtering)
router.get('/posts', async (req, res) => {
  try {
    const posts = await Post.find().populate('createdBy', 'username');
    res.render('posts', { posts });
  } catch (err) {
    console.error('❌ Error fetching posts:', err);
    req.flash('error', 'Error fetching posts.');
    res.redirect('/');
  }
});


// View Single Post
router.get('/posts/:id', async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        req.flash('error', 'Invalid post ID');
        return res.redirect('/posts');
    }

    try {
        const post = await Post.findById(req.params.id).populate('createdBy', 'username');
        if (!post) {
            req.flash('error', 'Post not found');
            return res.redirect('/posts');
        }
        res.render('post', { post });
    } catch (err) {
        console.error('Error fetching post:', err);
        req.flash('error', 'Error fetching post');
        res.redirect('/posts');
    }
});


// Edit & Update Post

router.get('/posts/:id/edit', isAuthenticated, checkPostOwnership, async (req, res) => {
  res.render('edit-post', { post: req.post });
});
router.post('/posts/:id', isAuthenticated, checkPostOwnership, async (req, res) => {
    try {
        Object.assign(req.post, req.body);
        await req.post.save();
        req.flash('success', 'Post updated');
        res.redirect(`/posts/${req.post._id}`);
    } catch (err) {
        console.error('Error updating post:', err);
        req.flash('error', 'Error updating post');
        res.redirect(`/posts/${req.params.id}/edit`);
    }
});


// Delete Post
router.post('/posts/:id/delete', isAuthenticated, checkPostOwnership, async (req, res) => {
    try {
        await req.post.deleteOne();
        req.flash('success', 'Post deleted');
        res.redirect('/posts');
    } catch (err) {
        console.error('Error deleting post:', err);
        req.flash('error', 'Error deleting post');
        res.redirect('/posts');
    }
});

module.exports = router;
