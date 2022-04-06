const path = require('path');
const express = require('express');
const morgan = require('morgan'); // logging middleware,see the request data right in the console
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const compression = require('compression'); // compress all the text responses like html and json
const cors = require('cors');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const bookingController = require('./controllers/bookingController');
const viewRouter = require('./routes/viewRoutes');
// start express application
const app = express();
app.enable('trust proxy');

app.set('view engine', 'pug'); // tell express about what template engine we want to use,pug is a tamplate engine
// path.join(__dirname, './views') create a path joining the directory name/ views
app.set('views', path.join(__dirname, './views'));
// 1) GLOBAL MIDDLEWARES

// implement cors
app.use(cors());
// Access-Control-Allow-Origin *
// Allow other website to access our api
// api.natours.com, (front-end) natous.com
// this will only allow 'https//www.natours.com' to create request to api.natours.com
// but in this case, we want to allow everyone so I will commend out these below codes.
// app.use(
//   cors({
//     origin: 'https//www.natours.com',
//   })
// );
// THIS WILL ONLY WORK FOR SIMPLE REQUEST WHICH ARE GET AND POST REQUEST
// ON THE OTHER HAND, WE HAVE NON SIMPLE REQUEST WHICH ARE PUT, PATCH AND DELETE REQUEST, or also request that send cookies.
// wheneve there is a non simple request, the browser will then automatically issue the preflight phase.
// before the real request like delete request occur, the browser will first does an options request to figure out if the actual request is safe to send. The server will need to respond to the option request
// an options is really just another HTTP method, which is get, post or delete
// when we get the option request on our server, we need to send back the same access control allow origin header, and this way the browser will then know that the actual request, delete request is safe to perform and then execute the delete request itself.

app.options('*', cors());
// app.options('/api/v1/tours/:id', cors());
//middleware, which is a function to process the incoming request data

// Serving static file
// will not go in any route
//to access something from our file system
// pass public directory to serve static file
// set the public folder to the root.
// server the file specified in the public folder
// basically define that all the static asset wil always automatically be served from a folder called public
// app.use(express.static(`${__dirname}/public`));

app.use(express.static(path.join(__dirname, 'public')));

// SET security HTTP headers
app.use(helmet());

// development logging
if (process.env.NODE_ENV === 'development') {
  // the morgan will return this (req, res, next) => {} }); functon as well, and then call next().
  // GET /api/v1/tours/1 200 8.658 ms - 1040
  app.use(morgan('dev'));
}
// Limit request from same API
// allow 100 request from same IP in 1 hour
// this limiter is basically a middleware function
// rateLimit is a function which will based on the object, create a middleware function
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});

app.use('/api', limiter);

app.post(
  '/webhook-checkout',
  bodyParser.raw({ type: 'application/json' }),
  bookingController.webhookCheckout
);
//test
// the reason we define this /webhook-checkout before the app.use(express.json({ limit: '10kb' })); because when we receive the body from stripe, the stripe function used to read the body need this body in a raw form. so basically as a string and not as json.

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true })); // (use for the form) parse data coming from the URL encoded form. // extended allow to pass some more complex data // limit -
// app.use(express.urlencoded({ extended: true, limit: '10kb' })); // (use for the form) parse data coming from the URL encoded form. // extended allow to pass some more complex data // limit -
app.use(cookieParser()); // parse the data from the cookie
// Data sanitization against NoSQL query injection

app.use(mongoSanitize()); // this middleware will look at the request body, request query string, and also request param, and it will basically filter out all of the dollar sign and dots.

// Data sanitization against XSS

// the attacker would try to inserts some malicious HTML code with some javascript code attached to it, and so if that is injected to our HTML site, it will cause some damage .
app.use(xss()); // this will then clean any user input from malicious html code.

//prevent parameter pollution
// this should be used here by the end because it will clear up the query string, and prevent duplicate
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ], // allow for duplicate in the query string
  })
);
app.use(compression());
// Test middleware
// app.use((req, res, next) => {
//   console.log('Hello from the middleware');
//   // console.log(req.cookies);
//   next();
//   // call next function to move on
// });
// Test middleware
app.use((req, res, next) => {
  // console.log('test run');
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  // console.log(x);
  next();
});

// app.get('/', (req, res) => {
//   res.status(200).render('base', {
//     tour: 'The Forest Hiker',
//     user: 'Jonas',
//   });
// });

// app.get('/overview', (req, res) => {
//   res.status(200).render('overview', {
//     title: 'All Tours',
//   });
// });
// app.get('/tour', (req, res) => {
//   res.status(200).render('tour', {
//     title: 'The Forest Hiker Tour',
//   });
// });
//testing git
// this tourRouter is a real middleware
// we will use the tourRouter in our application, which is /api/v1/tours
// we use the middleware for this specific route '/api/v1/tours'.
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);
// this route handler need to be put after the tourRouter and userRouter middleware.
// if the route does not match with the tourRouter and userRouter then the route handler belowe will be called to display the error message.
// use * which represent for everything
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on this server`,
  // });
  // const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  // err.status = 'fail';
  // err.statusCode = 404;
  // next(err);
  // define the status and the status code on the error object, and then the error handling middleware can then use them in the next step.
  // whatever we pass anything into next, if it assume it is error, then it will skip all the other middlewares in the middleware stack and send the error to the global error handling middleware.
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// error handling middleware
app.use(globalErrorHandler);
// put ? to make the y optional
// app.get('/api/v1/tours/:id/:x/:y?', (req, res) => {
//   console.log(req.params);
//   res.status(200).json({ status: 'success ' });
// });

// // app.post('/', (req, res) => {
// //   // the detail will show in postman
// //   res.send('You can post to this endpoint...');
// // });

// the get method is sent to the server on this url '/' // '/' - root url (127.0.0.1:3000)
// app.get('/', (req, res) => {
//   // the detail will show in postman
//   res
//     .status(200)
//     .json({ message: 'Hello from the server side!', app: 'Natours' });
// });

// // to get the data
// app.get('/api/v1/tours', getAllTours);
// app.get('/api/v1/tours/:id', getTour);
// // to create the data
// app.post('/api/v1/tours', createTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

// // same method as above
// tourRouter.route('/').get(getAllTours).post(createTour);
// // at here the request response cycle already end, and the middleware will not be printed to the console
// // app.use((req, res, next) => {
// //   console.log('Hello from the middleware');
// //   next();
// //   // call next function to move on
// // });

// tourRouter.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

module.exports = app;
