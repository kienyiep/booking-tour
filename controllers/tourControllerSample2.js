const Tour = require('./../model/tourModel');
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = async (req, res) => {
  try {
    // console.log(req.query);
    // BUILD QUERY
    // 1A) Filtering
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);
    // will return the object, which consist the key and value(?duration=5&difficulty=easy)
    // console.log(req.query); //{ duration: '5', difficulty: 'easy', test: '23' }
    // const tours = await Tour.find({
    //   duration: 5,
    //   difficulty: 'easy ',
    // });
    // const tours = await Tour.find(req.query);
    // const tours = await Tour.find(queryObj);
    // it will be impossible to chain the method if we await the query here right away
    // so chain the methods to the query first, then only we await that query

    // 1B)Advanced filtering
    // replace {  duration: { $gte: 5 } } ,difficulty: 'easy' to { duration: { gte: '5' }, difficulty: 'easy' }
    console.log(queryObj);
    let queryStr = JSON.stringify(queryObj);
    console.log(queryStr);

    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`); // b - match the exact word g - happen mutliple time, replace all the operators but not first occurance.
    console.log(queryStr);
    console.log(JSON.parse(queryStr));
    // { duration: { '$gte': '5' }, difficulty: 'easy' }
    let query = Tour.find(JSON.parse(queryStr));

    //2) Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      console.log(sortBy);
      query = query.sort(sortBy);
      // sort('price ratingAverage') // first sort by price, if tie then sort the ratingAverage as second criteria
    } else {
      query = query.sort('-createdAt');
    }

    // 3) Field limiting

    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      // query = query.select('name duration difficulty');
      query = query.select(fields);
    } else {
      query = query.select('-__v'); // have everything except the v field, exclude the v field
    }

    // 4) Pagination
    const page = req.query.page * 1 || 1; // convet string to number, put || to set default value
    const limit = req.query.limit * 1 || 100; // convet string to number, put || to set default value
    const skip = (page - 1) * limit;
    //page=2&limit=10, 1 page only has 10 result, 1st page (1-10), 2nd page (11-20)
    query = query.skip(skip).limit(limit); // skip 10 in order to get to result number 11, so that we start at page 2.

    if (req.query.page) {
      const numTours = await Tour.countDocuments();
      if (skip >= numTours) throw new Error('This page does not exist'); // the error throw here, because it will be caught in the catch block.
    }
    // EXECUTE QUERY
    const tours = await query;

    // const tours = await Tour.find()
    //   .where('duration')
    //   .equals(5)
    //   .where('difficulty')
    //   .equals(5);

    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
      // requestedAt: req.requestTime,
      result: tours.length,
      data: { tours: tours },
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
  // console.log(req.params);

  // const id = req.params.id * 1; // convert the string to number
  // const tour = tours.find((el) => el.id === id);
};

exports.createTour = async (req, res) => {
  try {
    // const newTours = new Tour({});
    // newTours.save();
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
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }); // id || the data want to change|| modified document will be returned || after the document is updated, the validator specified in the schema will run again
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
