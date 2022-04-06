const mongoose = require('mongoose'); // configure the mongoDB
const slugify = require('slugify');
const validator = require('validator');
const User = require('./userModel');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true, // cannot have same name
      trim: true,
      maxlength: [40, 'A tour name must have less or equal than 40 characters'],
      minlength: [10, 'A tour name must have more or equal than 10 characters'],
      // validate: [validator.isAlpha, 'Tour name must only contain characters'], // cannot include number and spaces
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },

    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either easy, medium, difficult',
      },
    },

    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: (val) => Math.round(val * 10) / 10, // 4.6666 -> 46.6666 -> 47 -> 4.7
    },

    ratingsQuantity: {
      type: Number,
      default: 0, // if the rating is not specified, it will automatically input 4.5
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // this only point to current doc on NEW document creation
          return val < this.price; // 200< 250 return true. this keyword always point to the current document when we create new document, so this function here will not work on the update.
        },
        message: 'Discount price ({VALUE}) should be below regular price',
      },
    },
    summary: {
      type: String,
      trim: true, // remove all the wide tring at the begin and at the end.
      required: [true, 'A tour must have a description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      default: 'tour-9-cover.jpg',
      // required: [true, 'A tour must have a cover image'],
    },
    images: {
      default: ['tour-9-1.jpg', 'tour-9-2.jpg', 'tour-9-3.jpg'],
      type: [String],
    }, // contain multiple images

    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: {
      default: [
        '2021-06-19T09:00:00.000+00:00',
        '2021-07-20T09:00:00.000+00:00',
        '2021-08-18T09:00:00.000+00:00',
      ],
      type: [String],
    }, // contain multiple Date
    secretTour: {
      type: Boolean,
      default: false,
    },

    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number], // longitude, latitude
      description: String,
      address: String,
    },

    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    // guides: Array,
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User', // create a reference to another model, with this you effectively create the relationship between these two dataset.
      },
    ], // the type is mongoDB ID
  },
  //define virtual property in our output.
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// we use function(){} regular function, because it will return this keyword.

// this duration weeks is not part of the database
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});
// virtual populate, we can get access to all the reviews for a certain tour, without actually keeping the array of review ID on the tour.

// Virtual populate
// whenver documents field are queried, with the index, mongoDB will search for the ordered index instead of searching through the whole collection and look at all the documents one by one. Hence with an index on the field that we are querying for, the process become much more effiecient.

//index
// tourSchema.index({ price: 1 }); // 1 ascending order, -1 descending order
//compound index
tourSchema.index({ price: 1, ratingsAverage: -1 });
// to ensure the uniquness of the fields, the mongo can create a unique index for the field.
// we will use unique slug to query for tours, meaning the slug will then probably become the most queried field, so it make sense to also have the index for the slug.
tourSchema.index({ slug: 1 });
// to be able to do geospatial query, we need to first attribute an index to the field where the geospatial data that we are searching for is stored.
// tourSchema.index({ startLocation: '2dsphere' }); // for geospatial data,the index need to be a 2D sphere index, if the data describe real points on the earth like sphere. Or instead, we can also use a 2D index if we are using just fictional point on a simple two dimensional plane, real point on the earth's surface.
tourSchema.virtual('reviews', {
  ref: 'Review',
  // this will specify the tour field located inside the review schema to connect these two models.
  foreignField: 'tour',
  localField: '_id', // this _id which is how it called in the local model, is called tour in the foreign model, so in the review model
});
// DOCUMENT MIDDLEWARE: runs before .save and .create()
// this function will be called before the actual document is saved to the database
tourSchema.pre('save', function (next) {
  console.log('before');
  // console.log(this); // will point to the currently processed document, access the document being processed or saved
  this.slug = slugify(this.name, { lower: true });
  next();
  // example of document before it is saved to the database
  // we can still act on the data before it is then saved to the database.
  // {
  //   ratingsAverage: 4.5,
  //   ratingsQuantity: 0,
  //   images: [],
  //   createdAt: 2022-03-03T11:42:22.289Z,
  //   startDates: [],
  //   _id: 6220b0442af7a1579402f1a4,
  //   name: 'Test tour',
  //   duration: 4,
  //   maxGroupSize: 10,
  //   difficulty: 'difficult',
  //   price: 997,
  //   summary: 'Test tour',
  //   imageCover: 'tour-3-cover.jpg',
  //   durationWeeks: 0.5714285714285714,
  //   id: '6220b0442af7a1579402f1a4'
  // }
});

// tourSchema.pre('save', async function (next) {
//   // since we use asynchronous function, hence it will return the promise, the guidePromises is basically an array full of promises
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

// this post middlewate not only access to next, but also to the document that was just saved to the database.
// executed after all the pre middleware have complete
tourSchema.pre('save', function (next) {
  console.log('will save document...');
  next();
});
tourSchema.post('save', function (doc, next) {
  console.log('after');
  // console.log(doc);
  next();
});

// query middleware
// we define the find query first, then here will be called.
// before the actual query is executed, the pre-find middleware here qill be executed first
// tourSchema.pre('find', function (next) {
//this /^find/ not only for find, but for all the command that start with the name find, so findOne, findOneAndDelete and other
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } }); // $ne - not equal
  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  }); // fill up the field called guides
  next();
});
// get access to all the document which returned from the query
// this middleware run after the query has executed.
tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} miliseconds`);
  // console.log(docs);
  next();
});
// tourSchema.pre('findOne', function (next) {
//   this.find({ secretTour: { $ne: true } });
//   next();
// });

// AGGREGATION MIDDLEWARE
// occur before the aggregation is actually executed
// since $geoNear need to run first, hence these aggregate code need to be commented first, otherwse the geoNear will be run after this pipeline.
// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } }); // add  at the beginning of the array
//   console.log(this.pipeline()); // this will point to the current aggregation object
//   next();
// });
const Tour = mongoose.model('Tour', tourSchema); // create a model
module.exports = Tour;

// 4 type of middleware in mongoose
// -document
// -query
// -aggregate
// -model
