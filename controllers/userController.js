const multer = require('multer');
const sharp = require('sharp');
const Users = require('./../model/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users'); // first argument, if there is no error then null.
//   },
//   filename: (req, file, cb) => {
//     // user-767676abc76dba-33232376764.jpeg // to guarantee there wont be two images with the same file name// user-userID-timestamp.jpeg
//     console.log(file);
//     // mimetype - image/jpeg
//     const extension = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${extension}`);
//   },
// });
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
//create a new router object in your program to handle requests
exports.uploadUserPhoto = upload.single('photo');
// single -one single file, and then specify the name of the field that is going to hold this file. This middleware upload.single('photo') will then take the file, copying it, and then put to the destination specified

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 }) // while doing image processing, it is best to not save the file to the disk,, but instead save it to the memory. // we set quality to compress it a little bit so that it does not take up   so much space.
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
exports.updateMe = catchAsync(async (req, res, next) => {
  // console.log(req.file);
  console.log(req.body);
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword',
        400
      )
    );
  }
  // 2) Filtered out unwan ted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email'); // what we want to keep in the body, and filter out all the rest
  if (req.file) filteredBody.photo = req.file.filename;
  // 3) Update user document
  const updatedUser = await Users.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true, // the new updated document will be returned instead of the old one
    runValidators: true, // validate our document
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});
exports.deleteMe = catchAsync(async (req, res, next) => {
  await Users.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined! Please use /sign up instead',
  });
};
exports.getUser = factory.getOne(Users);
exports.getAllUsers = factory.getAll(Users);
// Do not update passwords with this
exports.updateUser = factory.updateOne(Users);
exports.deleteUser = factory.deleteOne(Users);
