// middleware/isAdmin.js


module.exports.isAdmin = (req, res, next) => {
  
  // checks user is logged in and is admin
    if (req.isAuthenticated() && req.user.isAdmin) {
      return next();
    }
  
    console.warn(`Admin access denied: ${req.originalUrl} by user ${req.user?.username || 'Unknown'}`);
    req.flash('error', 'You must be an admin to access this page.');
    res.redirect('/login');
  };
  