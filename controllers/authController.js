const crypto = require('crypto');
const { promisify } = require('util'); // to use the promisify method
const jwt = require('jsonwebtoken');
const User = require('./../model/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Email = require('./../utils/email');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id); // In mongoDB, the id is called _id. (payload,secret)
  // cookie is basically a small piece of text that a server can send to clients, when the clients receive the cookie, it will automatically store it and then automatically send it back along with all future request to the same server

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ), // browser will delete the cookie after it has expired
    // secure: true, // the cookie will only be sent on an encrypted connection, which cis https
    httpOnly: true, // the cookie cannot be  modified in any way by the browser, and prevent those cross-site scripting attack.
    // if the connection is secure then the req.secure is true or the  req.header['x-forwarded-proto'] is 'https'
    secure: req.secure || req.header['x-forwarded-proto'] === 'https',
    // secure cannot be verified in the first place because heroku act as a proxy, which will redirect or modify all incoming requests in our application before they actually reach the app
    // hence we need to specify app.enable('trust proxy)
  };

  // if (req.secure || req.header['x-forwarded-proto'] === 'https')
  //   cookieOptions.secure = true;
  // if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions); // name of the cookie, the data want to sent, couple of option
  // remove password from output.
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};
exports.signup = catchAsync(async (req, res, next) => {
  // const newUser = await User.create(req.body);

  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    // passwordChangedAt: req.body.passwordChangedAt,
  });
  const url = `${req.protocol}://${req.get('host')}/me`;
  // console.log(url);
  await new Email(newUser, url).sendWelcome();

  createSendToken(newUser, 201, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
  // const email = req.body.email;
  // const password = req.body.password;
  const { email, password } = req.body;

  //1)Check if email and password exist

  if (!email || !password) {
    return next(new AppError('Please provide email and password !', 400));
  }
  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email: email }).select('+password');
  // const user2 = await User.findOne({ email: email });
  // const correct = await user.correctPassword(password, user.password);
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  // 3) If everything ok, send token to client\
  createSendToken(user, 200, req, res);
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000), // 10 second
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

exports.protect = catchAsync(async (req, res, next) => {
  //1) Get the token and check if it is there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    // console.log(token);
    return next(
      new AppError(' Your are not logged in! Please log in to get access.', 401)
    );
  }
  //2) Verification token
  // to promisifying a function, to make it return a promise
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log(decoded);

  //3) Check if user still exists
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401
      )
    );
  }
  //4) Check if user changed password after the token was issued
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again', 401)
    );
  } // issued at

  //GRANT ACCESS TO PROTECTED ROUTE
  req.user = freshUser;
  res.locals.user = freshUser;
  next();
});
//only for render pages, no errors!
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      //1) verify token
      // to promisifying a function, to make it return a promise
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );
      console.log(decoded);

      //2) Check if user still exists
      const freshUser = await User.findById(decoded.id);
      if (!freshUser) {
        return next();
      }
      //3) Check if user changed password after the token was issued
      if (freshUser.changedPasswordAfter(decoded.iat)) {
        return next();
      } // issued at

      //THERE IS A LOGGED IN USER
      // Make the user accessible to our template
      res.locals.user = freshUser;

      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};
// (...roles) will create an array of all the arguments specified
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    //roles ['admin','lead-guide']. role='user'

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTED email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with email address.', 404));
  }
  //2) Generate the random reset token

  const resetToken = await user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false }); // deactivate all the validators that we specified in our schema

  //3) Send it to user email

  // const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\ nIf you didn't forget your password, please ignore this email.`;

  try {
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/resetPassword/${resetToken}`; // prepare here to work both on development and production.
    // await sendEmail({
    //   email: user.email,
    //   subject: 'Your password reset token (valid for 10 min)',
    //   message,
    // });
    await new Email(user, resetURL, resetToken).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
      token: resetToken,
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false }); // deactivate all the validators that we specified in our schema
    return next(
      new AppError(
        'There was an error sending the email. Try again later!',
        500
      )
    );
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token

  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex'); // the params is the token(:token)4
  console.log(`Reset token: ${hashedToken}`);
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  // we use save() instead of update because save() will run all the validators.
  await user.save();
  // 3) Update changedPasswordAt property for the user

  // 4) log the user in
  createSendToken(user, 200, req, res);
});

exports.updatePassword = async (req, res, next) => {
  //1) Get user from the collection
  const user = await User.findById(req.user.id).select('+password');
  //2) Check if the POSTED current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }
  //3) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // cannot use the user.findByIdAndUpdate, because the validator cannot work in the passwordConfirm because the this. will only work on create and save function but will not work on update, which is also same goes to the pre save middleware.
  //4) Log user in, send JWT

  createSendToken(user, 200, req, res);
};
