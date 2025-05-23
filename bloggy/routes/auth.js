// routes/auth.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');
const User = require('../models/User');
const { registerValidation, loginValidation } = require('../controllers/validation');


// GET Register Page
router.get('/register', (req, res, next) => {
  res.render('register');
});


// POST Register User
router.post('/register', async (req, res) => {
  try {
    // Validate the incoming data
    const { error } = registerValidation.validate(req.body);

    if (error) {
      req.flash('error', error.details.map(detail => detail.message));
      return res.redirect('/register');
    }

    const { username, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      req.flash('error', 'Username already exists.');
      return res.redirect('/register');
    }


    // Create a new user
    const newUser = new User({
      username,
      password, //hashedPassword add a : after password
    });

    await newUser.save();

    // If React (JSON) wants a JSON response:
    if (req.get('accept')?.includes('application/json')) {
      return res.json({
        success: true,
        user: { id: newUser._id, username: newUser.username }
      });
    }

    // Otherwise fall back to Pug UI:
    req.flash('success', 'Registration successful! You can now log in.');
    return res.redirect('/login');
  } catch (err) {
    console.error('Registration error:', err);
    if (req.get('accept')?.includes('application/json')) {
      return res
        .status(500)
        .json({ success: false, message: err.message });
    }
    req.flash('error', 'Something went wrong during registration.');
    return res.redirect('/register');
  }

});


// GET Login Page
router.get('/login', (req, res) => {
  res.render('login');
});


// POST Login User
router.post('/login', (req, res, next) => {
  const { error } = loginValidation.validate(req.body);

  if (error) {
    req.flash('error', error.details.map(detail => detail.message));
    return res.redirect('/login');
  }

  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      if (req.get('accept')?.includes('application/json')) {
        return res.status(401).json({ message: info.message });
      }
      req.flash('error', info.message);
      return res.redirect('/login');
    }

    req.login(user, err => {
      if (err) return next(err);
      if (req.get('accept')?.includes('application/json')) {
        return res.json({
          success: true,
          user: { id: user._id, username: user.username, isAdmin: user.isAdmin }
        });
      }
      req.flash('success', 'Welcome back!');
      return res.redirect('/');
    });
  })(req, res, next);
});


// GET Logout User
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
      req.flash('error', 'Error logging out.');
      return res.redirect('/');
    }
    req.flash('success', 'Logged out successfully.');
    res.redirect('/login');
  });
});

module.exports = router;
