const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');
const router = express.Router();

// router.use(authController.isLoggedIn);

router.use(viewsController.alerts);
router.get(
  '/',
  // bookingController.createBookingCheckout,
  authController.isLoggedIn,
  viewsController.getOverview
);
router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour);
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);
router.get(
  '/signup',
  authController.isLoggedIn,
  viewsController.getRegisterForm
);
router.get(
  '/forgotPassword',
  authController.isLoggedIn,
  viewsController.getForgotForm
);
router.get(
  '/resetToken',
  authController.isLoggedIn,
  viewsController.getTokenForm
);
router.get(
  '/manageTour',
  authController.isLoggedIn,
  viewsController.getManageTour
);

router.get(
  '/addNewTour',
  authController.isLoggedIn,
  viewsController.addNewTour
);
router.get(
  '/updateTour/:tourId',
  authController.isLoggedIn,
  viewsController.updateTour
);
router.get(
  '/deleteTour/:tourId',
  authController.isLoggedIn,
  viewsController.deleteTour
);
router.get(
  '/resetPassword/:token',
  authController.isLoggedIn,
  viewsController.getResetForm
);
router.get('/me', authController.protect, viewsController.getAccount);

router.get('/my-tours', authController.protect, viewsController.getMyTours);
//  /login

router.post(
  '/submit-user-data',
  authController.protect,
  viewsController.updateUserData
);
router.post(
  '/add-user-data',
  authController.protect,
  viewsController.addUserData
);
router.post(
  '/update-tour-data/:updateId',
  authController.protect,
  viewsController.updateTourData
);
module.exports = router;
