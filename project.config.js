// project.config.js
const projectConfig = {
  backendPort: 8010,
  frontendPort: 5178,

  // Google OAuth credentials
  googleClientID:     process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
};

// Dynamically derive your backend base URL
projectConfig.baseUrl = `http://localhost:${projectConfig.backendPort}`;

module.exports = projectConfig;
