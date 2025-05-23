// controllers/apiAuth.js
const express           = require('express');
const passport          = require('passport');
const User              = require('../models/User');
const {
  registerValidation,
  loginValidation
} = require('./validation');

const router = express.Router();

// — Who am I? — GET /api/auth/me
router.get('/me', (req, res) => {
  try {
    if (req.user) {
      return res.json({
        user: {
          id:       req.user._id,
          username: req.user.username,
          isAdmin:  req.user.isAdmin
        }
      });
    }
    res.json({ user: null });
  } catch (err) {
    console.error('Error in /api/auth/me:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// — Register — POST /api/auth/register
router.post('/register', async (req, res) => {
  const { error } = registerValidation.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const { username, password } = req.body;
    const user = new User({ username, password });  // pre-save hook hashes it
    await user.save();
    res.status(201).json({ message: 'Registration successful! You can now log in.' });
  } catch (err) {
    console.error('Error in /api/auth/register:', err);
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Username already exists.' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// — Login — POST /api/auth/login
router.post('/login', (req, res, next) => {
  const { error } = loginValidation.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({ message: info.message });
    }

    req.login(user, loginErr => {
      if (loginErr) return next(loginErr);
      return res.json({
        user: {
          id:       user._id,
          username: user.username,
          isAdmin:  user.isAdmin
        }
      });
    });
  })(req, res, next);
});

// — Logout — GET /api/auth/logout
router.get('/logout', (req, res) => {
  req.logout(err => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ message: 'Server error' });
    }
    res.json({ message: 'Logged out' });
  });
});

module.exports = router;
