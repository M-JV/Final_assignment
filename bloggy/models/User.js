// models/User.js


const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false }
});


// Hash password before saving to the database
userSchema.pre('save', async function (next) {

  // avoids rehashing
  if (this.isModified('password')) {
    try {
      const salt = await bcrypt.genSalt(10); // Generates a cryptographic “salt” with 10 rounds—higher = more secure but slower.
      this.password = await bcrypt.hash(this.password, salt); // Produces the salted hash and overwrites this.password with it.
    } catch (error) {
      return next(error);
    }
  }
  next();
});


// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
