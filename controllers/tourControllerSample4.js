const Tour = require('./../model/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const factory = require('./handlerFactory');
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = catchAsync(async (req, res, next) => {
  // EXECUTE QUERY
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const tours = await features.query;

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',

    result: tours.length,
    data: { tours },
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id).populate('reviews');
  if (!tour) {
    // return here without move to the next line
    return next(new AppError('No tour found with that ID', 404));
  }
  res.status(200).json({ status: 'success', data: { tour } });
});

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

exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!tour) {
    // return here without move to the next line
    return next(new AppError('No tour found with that ID', 404));
  }
  res.status(200).json({ status: 'success', data: { tour } });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);
  if (!tour) {
    // return here without move to the next line
    return next(new AppError('No tour found with that ID', 404));
  }
  res
    .status(204) // 204 means no content
    .json({ status: 'success', data: null });
});
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
      $match: { _id: { $ne: '$EASY' } }, // $ne - not equal
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
      $sort: { numTourStarts: -1 }, //descending
    },
    { $limit: 12 }, // only 12 documents will print out
  ]);
  res
    .status(200) // 204 means no content
    .json({ status: 'success', plan });
});
