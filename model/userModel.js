const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
// name, email, photo, password, passwordConfirm

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Please tell use your name!'] },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false,
  },

  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      //This is only work on CREATE and SAVE!!!
      validator: function (el) {
        return el === this.password;
      },
      message: 'Password are not the same!',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});
// we need to comment all the pre save middleware, to skip the password encryption step while importing the dev data
// we use pre save middleware because the encryption will happen between the moment that we receive the data and the moment where it is actually  persisted to the database, between getting the data and saving it to the database.
userSchema.pre('save', async function (next) {
  // Only runthis function if password was actually modified
  if (!this.isModified('password')) return next();

  // hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  //Delete password Confirm field.
  this.passwordConfirm = undefined; // delete the passwordConfirm, so that it is no longer exist in the database
  next();
});
userSchema.pre('save', function (next) {
  // this.isNew means the document is new
  if (!this.isModified('password') || this.isNew) return next();
  // sometime the changedPassword timestamp is slow, and may be slower than the jwt timestamp.
  // hence. this issue will cause the jwt timestamp is created a bit before the changePassword timestamp created.
  // to solve this issue, we will put the passwordChanged one second in the past, which will then ensure the jwt timestamp is always created after the password has been changed.
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  // this point to the current query
  this.find({ active: { $ne: false } });
  next();
});
// this instance method is basically a method that is gonna be available on all documents of a certain collection
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  // this keyword point to current document, but cannot be used since the password is already set to select= false
  // this.password;
  return await bcrypt.compare(candidatePassword, userPassword); // return true if the password is same
};

userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    console.log(changedTimeStamp, JWTTimeStamp);
    return JWTTimeStamp < changedTimeStamp;
    // the time at which the token was issued is lesser than the changedTimeStamp
    // if return true means changed, false means not changed
  }

  // False means NOT changes
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex'); // convert it into hexadecimal string

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex'); // digest - store it as a hexadecimal

  console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};
const User = mongoose.model('User', userSchema);
module.exports = User;
