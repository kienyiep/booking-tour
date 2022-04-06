class AppError extends Error {
  constructor(message, statusCode) {
    super(message); // extend the Error parent class, and call the parent constructor.
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
    // when a new object is created and a constructor function is called, then that function call will not appear in the stack trace, and will not pollute it.
  }
}

module.exports = AppError;
