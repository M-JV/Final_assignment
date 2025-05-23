// config/passportConfig.js
const passport      = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User          = require('../models/User');

// Configure the “local” strategy to use your comparePassword() method
passport.use(new LocalStrategy(
  {
    usernameField: 'username',
    passwordField: 'password'
  },
  async (username, password, done) => {
    try {
      const user = await User.findOne({ username: username.trim() });
      if (!user) {
        return done(null, false, { message: 'User not found. Please register first.' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return done(null, false, { message: 'Invalid password. Please try again.' });
      }

      return done(null, user);
    } catch (err) {
      console.error('Error in authentication:', err);
      return done(err);
    }
  }
));

// Serialize / deserialize
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    if (!user) {
      return done(null, false, { message: 'User session invalid. Please log in again.' });
    }
    done(null, user);
  } catch (err) {
    console.error('Error in session management:', err);
    done(err, false);
  }
});

module.exports = passport;
