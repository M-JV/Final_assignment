// controllers/validation.js

// importing joi
const Joi = require('@hapi/joi');


// Registration Validation Schema
const registerValidation = Joi.object({
  username: Joi.string().required().messages({
    'string.empty': 'Username is required',
  }),
  email:    Joi.string().email().lowercase().required(),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'string.empty': 'Password is required',
  }),
  _csrf: Joi.string(), // allow _csrf token
});


// Login Validation Schema
const loginValidation = Joi.object({
  username: Joi.string().required().messages({
    'string.empty': 'Username is required',
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Password is required',
  }),
  _csrf: Joi.string(), // allow _csrf token, whitelisting
});


// Blog Post Validation Schema
const postValidation = Joi.object({
  title: Joi.string().required().messages({
    'string.empty': 'Title is required',
  }),
  content: Joi.string().required().messages({
    'string.empty': 'Content is required',
  }),
  _csrf: Joi.string(), // allow _csrf token, otherwise joi complains
  tags:    Joi.array().items(Joi.string().min(1).max(30)).optional()
});

module.exports = { registerValidation, loginValidation, postValidation };