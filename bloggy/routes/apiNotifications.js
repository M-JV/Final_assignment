// routes/apiNotifications.js
const express            = require('express');
const Notification       = require('../models/Notification');
const { isAuthenticated } = require('../middleware/auth');
const router             = express.Router();

// GET /api/notifications — list all (newest first)
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const notifs = await Notification.find({ recipientId: req.user._id })
      .sort('-createdAt')
      .populate({
        path: 'postId',
        select: 'title createdBy',
        populate: { path: 'createdBy', select: 'username' }
      });

    // shape it for the frontend
    const payload = notifs.map(n => ({
      postId:    n.postId._id,
      title:     n.postId.title,
      author:    n.postId.createdBy.username,
      createdAt: n.createdAt,
      seen:      n.seen
    }));

    res.json(payload);
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ message: 'Error fetching notifications' });
  }
});

// PATCH /api/notifications/mark-seen
router.patch('/mark-seen', isAuthenticated, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipientId: req.user._id, seen: false },
      { seen: true }
    );
    res.json({ message: 'All marked seen' });
  } catch (err) {
    console.error('Error marking notifications:', err);
    res.status(500).json({ message: 'Error marking notifications' });
  }
});

module.exports = router;
