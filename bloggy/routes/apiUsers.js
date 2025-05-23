const express = require('express')
const User    = require('../models/User')
const { isAuthenticated } = require('../middleware/auth')
const router  = express.Router()

// — List all users — no passwords or sensitive fields
//    GET /api/users
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('_id username')
    res.json(users)
  } catch (err) {
    console.error('Error fetching users:', err)
    res.status(500).json({ message: 'Error fetching users' })
  }
})

// — Check if current user is following :id
//    GET /api/users/:id/isSubscribed
router.get('/:id/isSubscribed', isAuthenticated, async (req, res) => {
  try {
    const me = await User.findById(req.user._id)
    const isSubscribed = me.following.includes(req.params.id)
    res.json({ isSubscribed })
  } catch (err) {
    console.error('Error checking subscription:', err)
    res.status(500).json({ message: 'Error checking subscription' })
  }
})

// — Follow (subscribe) a user
//    POST /api/users/:id/follow
router.post('/:id/follow', isAuthenticated, async (req, res) => {
  if (req.user._id.equals(req.params.id)) {
    return res.status(400).json({ message: "You can't follow yourself." })
  }
  try {
    await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { following: req.params.id } }
    )
    res.json({ message: 'Subscribed' })
  } catch (err) {
    console.error('Error subscribing:', err)
    res.status(500).json({ message: 'Error subscribing' })
  }
})

// — Unfollow (unsubscribe) a user
//    POST /api/users/:id/unfollow
router.post('/:id/unfollow', isAuthenticated, async (req, res) => {
  try {
    await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { following: req.params.id } }
    )
    res.json({ message: 'Unsubscribed' })
  } catch (err) {
    console.error('Error unsubscribing:', err)
    res.status(500).json({ message: 'Error unsubscribing' })
  }
})

// — (Optional) List everyone I follow
//    GET /api/users/me/following
router.get('/me/following', isAuthenticated, async (req, res) => {
  try {
    const me = await User.findById(req.user._id).populate('following', 'username')
    res.json(me.following)
  } catch (err) {
    console.error('Error fetching following list:', err)
    res.status(500).json({ message: 'Error fetching following list' })
  }
})

module.exports = router
