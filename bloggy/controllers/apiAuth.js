// controllers/apiAuth.js
const express          = require('express');
const passport         = require('passport');
const User             = require('../models/User');
const {
  registerValidation,
  loginValidation
} = require('./validation');

const router = express.Router();

// — Who am I? — GET /api/auth/me
router.get('/me', (req, res) => {
  if (req.user) {
    return res.json({
      user: {
        id:       req.user._id,
        username: req.user.username,
        email:    req.user.email,
        isAdmin:  req.user.isAdmin
      }
    });
  }
  res.json({ user: null });
});

// — Register — POST /api/auth/register
router.post('/register', async (req, res) => {
  // 1) Validate input
  const { error } = registerValidation.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { username, email, password } = req.body;

  try {
    // 2) Ensure unique username & email
    const conflict = await User.findOne({
      $or: [{ username }, { email }]
    });
    if (conflict) {
      return res
        .status(400)
        .json({ message: conflict.username === username
          ? 'Username already in use'
          : 'Email already in use'
        });
    }

    // 3) Create & save user (pre-save hook hashes password)
    const user = new User({ username, email, password });
    await user.save();

    // 4) Auto-login after registration
    req.login(user, err => {
      if (err) {
        console.error('Auto-login error:', err);
        return res.status(500).json({ message: 'Registration succeeded, but auto-login failed.' });
      }
      // 5) Return the newly registered user
      res.status(201).json({
        user: {
          id:       user._id,
          username: user.username,
          email:    user.email,
          isAdmin:  user.isAdmin
        }
      });
    });
  } catch (err) {
    console.error('Error in /api/auth/register:', err);
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
    if (err)      return next(err);
    if (!user)    return res.status(401).json({ message: info.message });

    req.login(user, loginErr => {
      if (loginErr) return next(loginErr);
      return res.json({
        user: {
          id:       user._id,
          username: user.username,
          email:    user.email,
          isAdmin:  user.isAdmin
        }
      });
    });
  })(req, res, next);
});

// ─── Trigger Google OAuth ─────────────────────────────────────────────────────
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// ─── Google OAuth Callback ────────────────────────────────────────────────────
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login',
    session: true
  }),
  (req, res) => {
    // on success, redirect back to React app
    res.redirect('/');
  }
);

// — Logout — GET /api/auth/logout
router.get('/logout', (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    res.json({ message: 'Logged out' });
  });
});

module.exports = router;
