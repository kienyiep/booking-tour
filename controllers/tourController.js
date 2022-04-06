const multer = require('multer');
const sharp = require('sharp');
const Tour = require('./../model/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const factory = require('./handlerFactory');

const multerStorage = multer.memoryStorage(); // this way the image will then stored as a buffer
// this function is used to test whether the uploaded file is an image
// if it is image, then we pass true to the callback.
// If it is not image, then we pass false to the cb function along with the error
const multerFilter = (req, file, cb) => {
  // mimetype - image/jpeg
  if (file.mimetype.startsWith('image')) {
    cb(null, true); // if there is image then no error, and then pass true
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

// upload.single('image'); req file
// upload.array('images', 5); req files
exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  console.log(req.files);

  if (!req.files.imageCover || !req.files.images) return next();

  //1) Cover image
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;

  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 }) // while doing image processing, it is best to not save the file to the disk,, but instead save it to the memory. // we set quality to compress it a little bit so that it does not take up   so much space.
    .toFile(`public/img/tours/${req.body.imageCover}`);
  // req.body.imageCover = imageCoverFilename;

  //2)Images
  req.body.images = [];

  // the async await will not work in the callback function of foreach loop
  // we can use map to save an array of all of these promises, and then if we have an array, we can use promise.all to await all of them, hence we will then actually await until all these image processing done, and only then move on to the next line and call the next middleware.
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 }) // while doing image processing, it is best to not save the file to the disk,, but instead save it to the memory. // we set quality to compress it a little bit so that it does not take up   so much space.
        .toFile(`public/img/tours/${filename}`);

      req.body.images.push(filename);
    })
  );
  // console.log(req.body);
  next();
});
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: 'reviews' });
// this function should not be called, but will wait till the express call it.
// express will call it as soon as someone hit the route.
// the solution is make the catchAsync function return another function
// the async function return will return a promise, therefore incase there is an error in the promise, we can then catch the error happened using the catch method that is available on all promise
// const catchAsync = (fn) => {
//   return (req, res, next) => {
//     // inside the catch method, we can just pass in the function, then the function will be called automatically, with the paramter that this callback receive (err) => next(err), so it is same as writing next
//     fn(req, res, next).catch(next);
//   };
// };
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);
// can look at the mongoDB documentation
// aggregation pipeline stages
// aggregation pipeline operator
exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        // _id: '$ratingsAverage',
        numTours: { $sum: 1 }, // fpr each of the document go through this pipeline, 1 will be added to this numTours.
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 }, // 1 for ascending
    },
    {
      $match: { _id: { $ne: 'EASY' } }, // $ne - not equal
    },
  ]);
  res
    .status(202) // 204 means no content
    .json({ status: 'success', data: stats });
});
// analyze how many tours we have in a given same month
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    { $unwind: '$startDates' }, // print out the document object based on the different startDates
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        }, // specified the range of the date to print out
      },
    },
    {
      // get no of total tour for each different month
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' }, // print out all the name of the tours in array  .
      },
    },

    {
      $addFields: { month: '$_id' },
    },
    {
      $project: { _id: 0 }, // put 0 so the id wont show, if 1 then the id will show.
    },
    {
      $sort: { numTourStarts: -1 }, //descendings
    },
    { $limit: 12 }, // only 12 documents will print out
  ]);
  res
    .status(200) // 204 means no content
    .json({ status: 'success', plan });
});

// /tours-within/:distance/center/:latlng/unit/:unit
// tour-within/233/center/34.111745,-118.113491/unit/mi

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  //  distance / 3963.2 - radius of the earth on miles
  //  distance / 6378.1 - radius of the earth on kilometers
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longitude in the format lat, lng',
        400
      )
    );
  }
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }, // centerShphere oprator takes an array of the coordinates and of the radius.
  }); // $geoWithin - basically finds documents within a certain geometry
  // console.log(distance, lat, lng, unit);
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001; // if not miles then kilometer
  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longitude in the format lat, lng',
        400
      )
    );
  }
  const distances = await Tour.aggregate([
    {
      // if you only habe one field with the geoSpatial index, then this geoNear stage will automatically use that index to perform the calculation. But if you have multiple field, with geospatial indexes, then you need to use the key parameter to define the field that you want to use  for calculations. In this case, we only have one field, and so automatically, that startLocation field is going to be used for doing these calculations
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      data: distances,
    },
  });
});
