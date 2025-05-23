// middleware/checkPostOwnership.js


const Post = require('../models/Post');
const mongoose = require('mongoose');


const checkPostOwnership = async (req, res, next) => {
    const postId = req.params.id;


    if (!mongoose.Types.ObjectId.isValid(postId)) {
        req.flash('error', 'Invalid post ID');
        return res.redirect('/posts');
    }


    try {
        const post = await Post.findById(postId);


        if (!post) {
            req.flash('error', 'Post not found');
            return res.redirect('/posts');
        }


        if (!post.createdBy.equals(req.user._id)) {
            req.flash('error', 'Unauthorized');
            return res.redirect('/posts');
        }

        
        // Attach post to request for reuse if needed
        req.post = post;
        next();
    } catch (err) {
        console.error('Ownership check failed:', err);
        req.flash('error', 'Something went wrong');
        res.redirect('/posts');
    }
};

module.exports = checkPostOwnership;
