const express = require('express');
const multer = require('multer');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

// const upload = multer({ dest: 'public/img/users' }); // dest-destination, the folder which will save all the uploaded images
// //create a new router object in your program to handle requests
const router = express.Router();
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// this will call the next middleware only if the user is authenticated
router.use(authController.protect);
//  all of these below middleware will be protected by the middleware: router.use(authController.protect);

router.patch('/updateMyPassword', authController.updatePassword);

router.get('/me', userController.getMe, userController.getUser);
router.patch(
  '/updateMe',
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe
);
router.delete('/deleteMe', userController.deleteMe);

router.use(authController.restrictTo('admin'));
// all the route below are not only protected but also will be restricted only to the admin
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
