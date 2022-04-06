const AppError = require('./../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}:${err.value}.`;
  return new AppError(message, 400);
};
const handleDuplicateFieldDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  console.log(value);
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid Input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired. Please log in again', 401);

const sendErrorDev = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  // B) RENDERED WEBSITE
  console.error('ERROR', err);
  return res.status(err.statusCode).render('error', {
    title: 'something went wrong!',
    errorMessage: err.message,
  });
};
const sendErrorProd = (err, req, res) => {
  // A)  API
  if (req.originalUrl.startsWith('/api')) {
    //A) operational, trusted error: send message to the client.
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    // B) programming or other unknown error: don't leak error details
    //1) log error (for the developer reference)
    console.error('ERROR', err);

    // 2) send generic messahe
    return res.status(500).json({
      status: 'error',
      message: 'something went very wrong',
    });
  }
  // B) RENDERED WEBSITE
  //A) operational, trusted error: send message to the client.
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'something went wrong!',
      errorMessage: err.message,
    });
  }
  //B) programming or other unknown error: don't leak error details
  //1) log error (for the developer reference)
  console.error('ERROR', err);

  // 2) send generic messahe
  return res.status(err.statusCode).render('error', {
    title: 'something went wrong!',
    errorMessage: 'Please try again later',
  });
};

module.exports = (err, req, res, next) => {
  // it will shows the error and where the error occur
  //Error: Can't find /api/v1/tour on this server!
  // at C:\Users\ASUS\Desktop\4-natours\starter\app.js:47:15
  //   console.log(err.stack);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error'; // 500 - error, 400 -fail
  if (process.env.NODE_ENV === 'development') {
    // in development, we want to get as much information about the error that occured as possible
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = Object.assign(err);
    // error.message = err.message;
    // in production, we want to leak as little information about our errors to the client as possible.
    // there are three types of errors that might be created by the mongoose in which we need to mark as operational errors.
    // so that we can then send back meaningful error messages to clients in production.
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);

    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
    // we are gonna pass the error that mongoose created into this function, and then this will return a new error created with our AppError class, and that error will then be marked as operational because all our AppError has the isOperational property set to true automatically.
    sendErrorProd(error, req, res);
  }
};
