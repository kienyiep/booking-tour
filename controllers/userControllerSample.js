const Users = require('./../model/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await Users.find();
  // SEND RESPONSE
  res.status(200).json({
    status: 'success',

    result: users.length,
    data: { users },
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
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
exports.getUser = factory.getOne(Users);
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined! Please use /sign up instead',
  });
};
// Do not update passwords with this
exports.updateUser = factory.updateOne(Users);
exports.deleteUser = factory.deleteOne(Users);
