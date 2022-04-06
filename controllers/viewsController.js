const Tour = require('../model/tourModel');
const User = require('../model/userModel');
const Booking = require('../model/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('./../utils/appError');
const multer = require('multer');
const sharp = require('sharp');

const multerStorage = multer.memoryStorage();

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

exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images1', maxCount: 1 },
  { name: 'images2', maxCount: 1 },
  { name: 'images3', maxCount: 1 },
]);

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  console.log(req.file);

  if (
    !req.file.imageCover ||
    !req.file.images1 ||
    !req.file.images2 ||
    !req.file.images3
  )
    return next();

  //1) Cover image
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  req.body.images1 = `tour-${req.params.id}-${Date.now()}-1.jpeg`;
  req.body.images2 = `tour-${req.params.id}-${Date.now()}-2.jpeg`;
  req.body.images3 = `tour-${req.params.id}-${Date.now()}-3.jpeg`;

  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  await sharp(req.files.images1[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.images1}`);

  await sharp(req.files.images2[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.images2}`);

  await sharp(req.files.images3[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.images3}`);

  next();
});

exports.alerts = (req, res, next) => {
  const { alert } = req.query;
  if (alert === 'booking')
    res.locals.alert =
      "your booking was successfull! Please check your email for a confirmation. If your booking doesn't show up here immediately, please come back later";

  next();
};
exports.getOverview = catchAsync(async (req, res, next) => {
  //1) Get tour data from collection
  const tours = await Tour.find();
  //2) Buld template
  //3) Render that templates using tour data from 1)
  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // 1) Get the data, for the requested tour (including reviews and guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  // if (!tour) {
  //   return next(new AppError('There is no tour with that name', 401));
  // }
  // 2) Build template

  // 3) Render template using data from 1)

  res.status(200).render('tour', {
    title: `${tour.name} tour`,
    tour,
  });
});
exports.addNewTour = catchAsync(async (req, res, next) => {
  res.locals.headers = 'addTour';
  res.status(200).render('addTour', {
    title: 'Add new tour',
  });
});
exports.updateTour = catchAsync(async (req, res, next) => {
  // console.log(`tourID: ${req.params.tourId}`);
  const updateTour = await Tour.findById(req.params.tourId);
  // console.log(updateTour);
  res.status(200).render('updateTour', {
    title: 'update tour',
    updateTour,
  });
});
exports.deleteTour = catchAsync(async (req, res, next) => {
  // console.log(`tourID: ${req.params.tourId}`);
  await Tour.findByIdAndDelete(req.params.tourId);
  // console.log(updateTour);
  const tours = await Tour.find();
  res.status(200).render('manageTour', {
    title: 'manage tour',
    tours,
    headers: 'manageTour',
  });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account',
  });
};
exports.getRegisterForm = (req, res) => {
  res.status(200).render('register', {
    title: 'Log into your account',
  });
};
exports.getForgotForm = (req, res) => {
  res.status(200).render('forgotPassword', {
    title: 'Forgot Password',
  });
};
exports.getTokenForm = (req, res) => {
  res.status(200).render('resetToken', {
    title: 'Reset your Password',
  });
};
exports.getResetForm = (req, res) => {
  if (req.params.token) {
    res.locals.token = req.params.token;
    res.status(200).render('resetPassword', {
      title: 'Reset your Password',
    });
  }
};
exports.getManageTour = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();
  res.locals.headers = 'manageTour';
  res.status(200).render('manageTour', {
    title: 'Manage the tour',
    tours,
  });
});

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account',
  });
};

exports.getMyTours = catchAsync(async (req, res, next) => {
  //1) Find all bookings
  const bookings = await Booking.find({ user: req.user.id });
  //2) Find tours with the returned ID
  const tourIDs = bookings.map((el) => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIDs } }); // this will select all the tours which have an ID which is in the tourIDs array
  res.status(200).render('overview', {
    title: 'My Tours',
    tours,
  });
});

exports.updateUserData = catchAsync(async (req, res, next) => {
  // never update password here, as it is not going to run safe middleware which will take care encrypt our password
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).render('account', {
    title: 'Your account',
    user: updatedUser,
  });
});
exports.addUserData = catchAsync(async (req, res, next) => {
  console.log('tour details');
  console.log(req.body);

  const createData = {
    name: req.body.name,
    duration: req.body.duration,
    maxGroupSize: req.body.maxGroupSize,
    difficulty: req.body.difficulty,
    price: req.body.price,
    priceDiscount: req.body.priceDiscount,
    summary: req.body.summary,
    description: req.body.description,
    imageCover: req.body.imageCover,
    images: [req.body.images1, req.body.images2, req.body.images3],
    startDates: [req.body.tourDate1, req.body.tourDate2, req.body.tourDate3],
    startLocation: {
      coordinates: [req.body.startlong, req.body.startlat],
      address: req.body.startAddress,
      description: req.body.startDescription,
    },

    locations: [
      {
        coordinates: [req.body.tourlong, req.body.tourlat],
        description: req.body.tourDescription,
        day: req.body.tourDay,
      },

      {
        coordinates: [req.body.tourlong2, req.body.tourlat2],
        description: req.body.tourDescription2,
        day: req.body.tourDay2,
      },

      {
        coordinates: [req.body.tourlong3, req.body.tourlat3],
        description: req.body.tourDescription3,
        day: req.body.tourDay3,
      },
    ],
    guides: [req.body.tourGuide1, req.body.tourGuide2, req.body.tourGuide3],
  };
  console.log(createData);
  const doc = await Tour.create(createData);
  console.log(req.body);
  const tours = await Tour.find();
  res.status(201).render('manageTour', {
    title: 'manage tour',
    headers: 'manageTour',
    tours,
  });
});

exports.updateTourData = catchAsync(async (req, res, next) => {
  console.log('tour details');
  console.log(req.body);

  const updateData = {
    name: req.body.name,
    duration: req.body.duration,
    maxGroupSize: req.body.maxGroupSize,
    difficulty: req.body.difficulty,
    price: req.body.price,
    summary: req.body.summary,
    description: req.body.description,
    imageCover: req.body.imageCover,
    images: [req.body.images1, req.body.images2, req.body.images3],
    startDates: [req.body.tourDate1, req.body.tourDate2, req.body.tourDate3],
    startLocation: {
      coordinates: [req.body.startlong, req.body.startlat],
      description: req.body.startDescription,
      address: req.body.startAddress,
    },

    locations: [
      {
        coordinates: [req.body.tourlong, req.body.tourlat],
        description: req.body.tourDescription,
        day: req.body.tourDay,
      },

      {
        coordinates: [req.body.tourlong2, req.body.tourlat2],
        description: req.body.tourDescription2,
        day: req.body.tourDay2,
      },

      {
        coordinates: [req.body.tourlong3, req.body.tourlat3],
        description: req.body.tourDescription3,
        day: req.body.tourDay3,
      },
    ],
    guides: [req.body.tourGuide1, req.body.tourGuide2, req.body.tourGuide3],
  };
  console.log(updateData);
  // const tours = await Tour.findByIdAndUpdate(req.params.updateId, req.body, {
  //   new: true,
  //   runValidators: true,
  // });
  await Tour.findByIdAndUpdate(req.params.updateId, updateData, {
    new: true,
    runValidators: true,
  });
  // console.log(req.body);
  const tours = await Tour.find();
  res.status(201).render('manageTour', {
    title: 'manage tour',
    headers: 'manageTour',
    tours,
  });
  // res.status(200).json({
  //   status: 'success',
  //   data: tours,
  // });
});
