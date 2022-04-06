const fs = require('fs');
const mongoose = require('mongoose'); // configure the mongoDB
const dotenv = require('dotenv');
// we could not read the process variable inside app.js because it is not yet configured, so we put before the app
const Tour = require('./../../model/tourModel');
const Review = require('./../../model/reviewModel');
const User = require('./../../model/userModel');
dotenv.config({ path: './config.env' }); // read the variable from the file and then save them into nodejs environment variable
const app = require('./../../app');

// console // get us the env environment variable
//   .log(app.get('env'));
//
const DB = process.env.Database.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
console.log(process.env);
mongoose
  // .connect(process.env.DATABASE_LOCAL, { // connect to the local database
  .connect(DB, {
    // some option to deal with deprecation warning
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then((con) => {
    console.log(con.connections);
    console.log('DB connection successful!');
  });

//read json file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8')); //
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8')); //
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
); //

// // import data into database
const importData = async () => {
  try {
    await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false }); // all the validation in the model will be skipped
    await Review.create(reviews);
    console.log('Data successfully loaded!');
  } catch (err) {
    console.log(err);
  }
  process.exit(); // stop the application
};

//DELETE ALL DATAFROM COLLECTION
const deleteData = async () => {
  try {
    await Tour.deleteMany(); // delete all of the document in the collection
    await User.deleteMany(); // delete all of the document in the collection
    await Review.deleteMany(); // delete all of the document in the collection
    console.log('Data successfully deleted!');
  } catch (err) {
    console.log(err);
  }
  process.exit(); // stop the application
};

console.log(process.argv);

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
