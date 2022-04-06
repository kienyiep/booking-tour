// const mongoose = require('mongoose'); // configure the mongoDB

// const dotenv = require('dotenv');
// // we could not read the process variable inside app.js because it is not yet configured, so we put before the app

// /////
// // uncaught exception are basically the errors or bugs that occur in our synchronous code but not handled anywhere
// // when there is uncaught exception, we really need to crash our application, becauce after there was an uncaught exception the enitre node process is in a so called unclean state. TO fix that, the process need to terminate, and then to be restarted.
// // in the production, we should then have a tool in place, which will restart the application after crashing.
// process.on('uncaughtException', (err) => {
//   console.log('UNCAUGHT EXCEPTION! Shutting  down...');
//   console.log(err.name, err.message);
//   // these errors are not gonna happen asynchronously, so they are not gonna have anything to do with the server.
//   // server.close(() => {
//   // by doing server.close(), we give the server time to finish all the request that are still pending or being handled at that time.
//   process.exit(1); // 0 - sucess 1 - uncaught excepti
//   // });
// });
// ///
// dotenv.config({ path: './config.env' }); // read the variable from the file and then save them into nodejs environment variable
// const app = require('./app');

// // console // get us the env environment variable
// //   .log(app.get('env'));
// //
// const DB = process.env.Database.replace(
//   '<PASSWORD>',
//   process.env.DATABASE_PASSWORD
// );
// // console.log(process.env);
// mongoose
//   // .connect(process.env.DATABASE_LOCAL, { // connect to the local database
//   .connect(DB, {
//     // some option to deal with deprecation warning
//     useNewUrlParser: true,
//     useCreateIndex: true,
//     useFindAndModify: false,
//   })
//   .then((con) => {
//     // console.log(con.connections);
//     console.log('DB connection successful!');
//   });

// // const testTour = new Tour({
// //   // new document created out of the tour model
// //   name: 'The Park Campers',
// //   price: 497,
// // });

// // testTour
// //   .save()
// //   .then((doc) => {
// //     console.log(doc);
// //   })
// //   .catch((err) => {
// //     console.log('ERROR: ', err);
// //   }); // save the document into database
// // 4) START SERVER
// const port = process.env.PORT || 3000;
// // this callback function will be called as soon as ther server start listening

// const server = app.listen(port, () => {
//   console.log(`App running on port ${port}...`);
// });
// // error occur outside express
// // mongoDB database down for some reason,
// // handle unhandled promise rejection
// // basically we are listening to this unhandled rejection event, which then allow us to handle all the errors that occur in asynchronous code which were not previously handled.

// process.on('unhandledRejection', (err) => {
//   console.log(err.name, err.message);
//   console.log('UNHANDLED REJECTION! Shutting  down...');

//   // shut down the application
//   // process.exit(1); // 0 - sucess 1 - uncaught exception
//   // just process.exit is a very abrupt way of ending the program because this will just immediately abort all the request that are currently sill running or pending.

//   // so usually we need to shut down gracefully, by first close the server and only then we shut down the application
//   server.close(() => {
//     // by doing server.close(), we give the server time to finish all the request that are still pending or being handled at that time.
//     process.exit(1); // 0 - sucess 1 - uncaught excepti
//   });
// });
// // TEST
// // can put inside the app.js and we will still catching that exception in our error handler, but it will not work in the middleware function
// // because the middleware function is only called as soon as actually there is a request
// // and when we do the request, the error will automatically go to the error handling middleware, without printing the console.
// // console.log(x);
