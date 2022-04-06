const Tour = require('./../model/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchhAsync = require('./..utils/catchAsync');
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = async (req, res) => {
  try {
    // BUILD QUERY
    // 1A) Filtering
    // const queryObj = { ...req.query };
    // const excludedFields = ['page', 'sort', 'limit', 'fields'];
    // excludedFields.forEach((el) => delete queryObj[el]);

    // console.log(queryObj);
    // let queryStr = JSON.stringify(queryObj);
    // console.log(queryStr);

    // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    // console.log(queryStr);
    // console.log(JSON.parse(queryStr));

    // let query = Tour.find(JSON.parse(queryStr));

    //2) Sorting
    // if (req.query.sort) {
    //   const sortBy = req.query.sort.split(',').join(' ');
    //   console.log(sortBy);
    //   query = query.sort(sortBy);
    // } else {
    //   query = query.sort('-createdAt');
    // }

    // 3) Field limiting

    // if (req.query.fields) {
    //   const fields = req.query.fields.split(',').join(' ');

    //   query = query.select(fields);
    // } else {
    //   query = query.select('-__v');
    // }

    // 4) Pagination
    // const page = req.query.page * 1 || 1;
    // const limit = req.query.limit * 1 || 100;
    // const skip = (page - 1) * limit;

    // query = query.skip(skip).limit(limit);

    // if (req.query.page) {
    //   const numTours = await Tour.countDocuments();
    //   if (skip >= numTours) throw new Error('This page does not exist');
    // }
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
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);

    res.status(200).json({ status: 'success', data: { tour } });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

// this function should not be called, but will wait till the express call it.
// express will call it as soon as someone hit the route.
// the solution is make the catchAsync function return another function
// the async function return will return a promise, therefore incase there is an error in the promise, we can then catch the error happened using the catch method that is available on all promise
const catchAsync = (fn) => {
  return (req, res, next) => {
    // inside the catch method, we can just pass in the function, then the function will be called automatically, with the paramter that this callback receive (err) => next(err), so it is same as writing next
    fn(req, res, next).catch(next);
  };
};

exports.createTour = catchAsync(async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
});

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({ status: 'success', data: { tour } });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res
      .status(204) // 204 means no content
      .json({ status: 'success', data: null });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};
// can look at the mongoDB documentation
// aggregation pipeline stages
// aggregation pipeline operator
exports.getTourStats = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};
// analyze how many tours we have in a given same month
exports.getMonthlyPlan = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(404).json({
      status: 'failss',
      message: err,
    });
  }
};
