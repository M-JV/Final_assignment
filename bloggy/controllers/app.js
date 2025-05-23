// controllers/app.js
require('dotenv').config();
const path        = require('path');
const express     = require('express');
const mongoose    = require('mongoose');
const session     = require('express-session');
const flash       = require('connect-flash');
const passport    = require('passport');

// <-- Load & configure Passport strategies
require('../config/passportConfig');

const apiAuth       = require('./apiAuth');
const apiPosts    = require('../routes/posts');
const apiAdmin      = require('../routes/apiAdmin');    // ← your new JSON admin API
const authRoutes    = require('../routes/auth');        // Pug‐based auth
const adminRoutes   = require('../routes/apiAdmin');       // Pug‐based admin dashboard
const Post          = require('../models/Post');
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

// ─── Expose flash messages & user to Pug views ─────────────────────────────────
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error   = req.flash('error');
  res.locals.user    = req.user;
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
                     // ← mount admin JSON API

// ─── Inject CSRF token into your Pug forms ──────────────────────────────────────
app.use(addCsrfToken);

// ─── Serve legacy public assets & set up Pug ───────────────────────────────────
app.use(express.static(path.join(__dirname, '../public')));
app.set('view engine', 'pug');

// ─── Serve React build for migrated routes ──────────────────────────────────────
const clientBuildPath = path.join(__dirname, '../../client/build');
const reactRoutes = [
  '/posts',
  '/posts/new',
  '/posts/:id',
  '/posts/:id/edit',
  '/my-posts',
  '/search',
  '/admin/posts',     // ← React‐based admin posts page
  '/admin/users',
  '/admin',            // admin dashboard React route
  '/admin/posts',       // ← React‐based admin users page
];
reactRoutes.forEach(route => {
  app.use(route, express.static(clientBuildPath));
  app.get(route, (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
});

// ─── Pug‐based routes for auth, home & admin ──────────────────────────────────
app.use(authRoutes);
app.use(adminRoutes);

// Home page (Pug)
app.get('/', async (req, res) => {
  const posts = await Post.find()
    .populate('createdBy', 'username')
    .limit(3);
  res.render('home', { posts });
});

// ─── Error Handling ────────────────────────────────────────────────────────────
// CSRF errors (for Pug forms)
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    req.flash('error', 'Invalid CSRF token.');
    return res.redirect('back');
  }
  next(err);
});

// JSON API errors
app.use((err, req, res, next) => {
  console.error(err);
  if (req.path.startsWith('/api/')) {
    return res.status(500).json({ message: err.message });
  }
  next(err);
});

// ─── Start Server ──────────────────────────────────────────────────────────────
const PORT = projectConfig.backendPort;
app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});