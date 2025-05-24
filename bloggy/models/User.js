// models/User.js

const mongoose = require('mongoose');
const bcrypt   = require('bcrypt');

const userSchema = new mongoose.Schema({
  username:  { type: String, required: true, unique: true, trim: true },
  email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:  { type: String, required: function() { return !this.googleId; } },
  googleId:  { type: String, unique: true, sparse: true },
  profileImage: { type: String }, 
  isAdmin:   { type: Boolean, default: false },
  // ← who this user is subscribed to:
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, {
  timestamps: true
});


// ─── Hash password before saving ────────────────────────────────────────────────
userSchema.pre('save', async function(next) {
  // only hash if password is set/modified
  if (this.isModified('password')) {
    try {
      const salt       = await bcrypt.genSalt(10);
      this.password    = await bcrypt.hash(this.password, salt);
    } catch (err) {
      return next(err);
    }
  }
  next();
});

// ─── Password comparison for local login ───────────────────────────────────────
userSchema.methods.comparePassword = async function(candidatePassword) {
  // if no local-password (OAuth user), always false
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
