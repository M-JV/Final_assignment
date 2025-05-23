// middleware/csrf.js

const csrf = require('csurf');

// Setup CSRF protection
const csrfProtection = csrf();

// retruns the token tied to the user
const addCsrfToken = (req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
};

module.exports = {
  csrfProtection,
  addCsrfToken
};
