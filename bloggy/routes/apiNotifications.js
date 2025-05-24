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
      .populate('postId', 'title');
    res.json(notifs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching notifications' });
  }
});

// PATCH /api/notifications/mark-seen — mark all unseen as seen
router.patch('/mark-seen', isAuthenticated, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipientId: req.user._id, seen: false },
      { seen: true }
    );
    res.json({ message: 'Notifications marked seen' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error marking notifications' });
  }
});

module.exports = router;
