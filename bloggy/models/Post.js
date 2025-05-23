// models/Post.js


const mongoose = require('mongoose');


const postSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true, trim: true },
  tags: [{ type: String, lowercase: true, trim: true }], // Ensuring uniform tag formatting
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', postSchema);

