// controllers/app.js
require('dotenv').config();
const path       = require('path');
const fs         = require('fs');
const express    = require('express');
const http       = require('http');
const mongoose   = require('mongoose');
const session    = require('express-session');
const flash      = require('connect-flash');
const passport   = require('passport');
const { Server } = require('socket.io');

// ← Passport
require('../config/passportConfig');

const apiAuth      = require('./apiAuth');
const apiPostsFn   = require('./apiPosts');
const apiUsers     = require('../routes/apiUsers');
const apiAdmin     = require('../routes/apiAdmin');
const apiNotifs    = require('../routes/apiNotifications');
const { csrfProtection, addCsrfToken } = require('../middleware/csrf');
const projectConfig = require(path.join(__dirname, '../../project.config.js'));

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, {
  cors: { origin: `http://localhost:${projectConfig.frontendPort}`, credentials: true }
});

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

// Body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session + Passport
const sessionMiddleware = session({
  secret:            process.env.SESSION_SECRET || 'replace_me!',
  resave:            false,
  saveUninitialized: false
});
app.use(sessionMiddleware);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// Expose flash & user to req
app.use((req, res, next) => {
  req.flash = req.flash.bind(req);
  next();
});

// Socket.io session & auth
io.use((socket, next) => {
  sessionMiddleware(socket.request, {}, next);
});
io.use((socket, next) => {
  const req = socket.request;
  if (req.session?.passport?.user) {
    socket.userId = req.session.passport.user;
    return next();
  }
  next(new Error('Unauthorized'));
});
io.on('connection', socket => {
  console.log('🔌 Socket connected for user', socket.userId);
  socket.join(socket.userId.toString());
});

// CSRF
app.use(csrfProtection);
app.get('/api/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// JSON APIs
app.use('/api/auth',          apiAuth);
app.use('/api/posts',         apiPostsFn(io));
app.use('/api/users',         apiUsers);
app.use('/api/admin',         apiAdmin);
app.use('/api/notifications', apiNotifs);

// For any legacy forms
app.use(addCsrfToken);

// (Prod-only) serve React build
if (process.env.NODE_ENV === 'production') {
  const clientDir = path.join(__dirname, '../../bloggy-client');
  let spaPath = null;
  if (fs.existsSync(path.join(clientDir, 'dist/index.html'))) {
    spaPath = path.join(clientDir, 'dist');
  } else if (fs.existsSync(path.join(clientDir, 'build/index.html'))) {
    spaPath = path.join(clientDir, 'build');
  }
  if (spaPath) {
    app.use(express.static(spaPath));
    app.get(/^\/(?!api\/).*/, (req, res) =>
      res.sendFile(path.join(spaPath, 'index.html'))
    );
  }
}

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  if (req.path.startsWith('/api/')) {
    return res.status(err.status || 500).json({ message: err.message });
  }
  next(err);
});


// ─── Start Server ──────────────────────────────────────────────────────────────
const PORT = projectConfig.backendPort;    // e.g. 5173
server.listen(PORT, () => {
  console.log(`🚀 HTTP + Socket.io listening on http://localhost:${PORT}`);
});
