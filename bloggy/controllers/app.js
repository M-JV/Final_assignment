// controllers/app.js
require('dotenv').config();
const path        = require('path');
const fs          = require('fs');
const express     = require('express');
const mongoose    = require('mongoose');
const session     = require('express-session');
const flash       = require('connect-flash');
const passport    = require('passport');

// <-- Load & configure Passport strategies
require('../config/passportConfig');

const apiAuth       = require('./apiAuth');
const apiPosts    = require('../routes/posts');
const apiAdmin      = require('../routes/apiAdmin'); 
const apiUsers  = require('../routes/apiUsers');   // ← your new JSON admin API
// const Post          = require('../models/Post');
const {
  csrfProtection,
  addCsrfToken
} = require('../middleware/csrf');

const projectConfig = require(path.join(__dirname, '../../project.config.js'));
const app           = express();

// ─── MongoDB ─────────────────────────────────────────────────────────────────
mongoose
  .connect(
    process.env.MONGODB_URI ||
      'mongodb+srv://mejova:me1jo2va3%40@bloggy.u09ewis.mongodb.net/?retryWrites=true&w=majority&appName=Bloggy',
    {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  )
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ─── Body Parsing ──────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Session, Flash & Passport ─────────────────────────────────────────────────
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'replace_me!',
    resave: false,
    saveUninitialized: false
  })
);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// ─── Make flash & user available on req (for JSON APIs) ────────────────────────
app.use((req, res, next) => {
  req.flash = req.flash.bind(req);
  req.user  = req.user;
  next();
});

// ─── CSRF PROTECTION ────────────────────────────────────────────────────────────
app.use(csrfProtection);

// 🔑 expose a JSON CSRF token endpoint for your React client
app.get('/api/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});


// ─── JSON API routes (no CSRF needed beyond this) ───────────────────────────────
app.use('/api/auth', apiAuth);
app.use('/api/posts', apiPosts);
app.use('/api/admin', apiAdmin);   
app.use('/api/users', apiUsers);

                     // ← mount admin JSON API

// ─── Inject CSRF token cookie into any (theoretical) HTML forms ────────────────
app.use(addCsrfToken);

// ─── Serve React ◀════════════════════════════════════════════════════════════
// The client folder is called "bloggy-client" next to "bloggy":
// ─── Serve React build in production only ──────────────────────────────────────
const isProd    = process.env.NODE_ENV === 'production';
const clientDir = path.join(__dirname, '../../bloggy-client');
if (isProd) {
  let spaPath = null;
  if (fs.existsSync(path.join(clientDir, 'dist', 'index.html'))) {
    spaPath = path.join(clientDir, 'dist');
  } else if (fs.existsSync(path.join(clientDir, 'build', 'index.html'))) {
    spaPath = path.join(clientDir, 'build');
  } else {
    console.warn(
      '\x1b[33m%s\x1b[0m',
      '⚠️  No React production build found. Run `cd bloggy-client && npm run build`.'
    );
  }

  if (spaPath) {
    app.use(express.static(spaPath));
    // any non-API GET → index.html
    app.get(/^\/(?!api\/).*/, (req, res) =>
      res.sendFile(path.join(spaPath, 'index.html'))
    );
  }
} else {
  console.log('🔧 Skipping React static‐serve (development mode)');
}

// ─── API error handler & server start ───────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err);
  if (req.path.startsWith('/api/')) {
    return res.status(err.status || 500).json({ message: err.message });
  }
  next(err);
});

// ─── Start Server ──────────────────────────────────────────────────────────────
const PORT = projectConfig.backendPort;
app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});