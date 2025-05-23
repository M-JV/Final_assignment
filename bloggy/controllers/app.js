// controllers/app.js
require('dotenv').config();
const path       = require('path');
const express    = require('express');
const mongoose   = require('mongoose');
const session    = require('express-session');
const flash      = require('connect-flash');
const passport   = require('passport');

// <-- Load & configure Passport strategies
require('../config/passportConfig');

const apiAuth     = require('./apiAuth');
const apiPosts    = require('./apiPosts');
const authRoutes  = require('../routes/auth');
const postRoutes  = require('../routes/posts');
const adminRoutes = require('../routes/admin');
const Post        = require('../models/Post');
const {
  csrfProtection,
  addCsrfToken
} = require('../middleware/csrf');

const projectConfig = require(path.join(__dirname, '../../project.config.js'));

const app = express();

// ─── MongoDB ─────────────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb+srv://mejova:me1jo2va3%40@bloggy.u09ewis.mongodb.net/?retryWrites=true&w=majority&appName=Bloggy',

 {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ─── Body Parsing ──────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Session, Flash & Passport ─────────────────────────────────────────────────
app.use(session({
  secret: process.env.SESSION_SECRET || 'replace_me!',
  resave: false,
  saveUninitialized: false
}));
app.use(flash());

app.use('/api/auth', require('./apiAuth'));
app.use('/api',      require('./apiPosts'));   // ← this line

// ─── Make flash & user available to Pug views ─────────────────────────────────
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error   = req.flash('error');
  res.locals.user    = req.user;
  next();
});

// ─── JSON API routes (no CSRF) ────────────────────────────────────────────────
app.use('/api/auth', apiAuth);
app.use('/api',      apiPosts);

// ─── Static & Views ───────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, '../public')));
app.set('view engine', 'pug');

// ─── CSRF for normal HTML forms ────────────────────────────────────────────────
app.use(csrfProtection);
app.use(addCsrfToken);

// ─── Pug‐based routes ─────────────────────────────────────────────────────────
app.use(authRoutes);
app.use(postRoutes);
app.use(adminRoutes);

app.get('/', async (req, res) => {
  const posts = await Post.find()
    .populate('createdBy', 'username')
    .limit(3);
  res.render('home', { posts });
});

// ─── Error Handling ────────────────────────────────────────────────────────────
// CSRF errors
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