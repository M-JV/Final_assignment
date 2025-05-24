// config/passportConfig.js
const projectConfig = require('../../project.config.js');
const passport      = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy  = require('passport-google-oauth20').Strategy;
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

// ─── Google OAuth 2.0 Strategy ────────────────────────────────────────────────
passport.use(new GoogleStrategy({
    clientID:     projectConfig.googleClientID,
    clientSecret: projectConfig.googleClientSecret,
    callbackURL:  `${projectConfig.baseUrl}/api/auth/google/callback`,
  },
   async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id })
      if (!user) {
        user = await User.create({
          username:     profile.displayName,
          email:        profile.emails[0].value,
          googleId:     profile.id,
          profileImage: profile.photos?.[0]?.value    // ← save it
        })
      } else if (!user.profileImage) {
        // in case you want to back-fill existing users
        user.profileImage = profile.photos?.[0]?.value
        await user.save()
      }
      done(null, user)
    } catch (err) {
      done(err)
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
