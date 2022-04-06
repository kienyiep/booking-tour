const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewRouter = require('./../routes/reviewRoutes');
// const reviewController = require('./../controllers/reviewController');
//create a new router object in your program to handle requests
const router = express.Router();

// middleware, part of the stack middlware
// router.param('id', (req, res, next, val) => {
//   next();
// });
// router.param('id', tourController.checkID);
// middleware

//POST /tour/234fad4/reviews
//GET /tour/234fad4/reviews
//GET /tour/234fad4/reviews/94887fda
// router
//   .route('/:tourId/reviews')
//   .post(
//     authController.protect,
//     authController.restrictTo('user'),
//     reviewController.createReview
//   );

router.use('/:tourId/reviews', reviewRouter); // with this we have the tour router and the review router nicely seperated and decoupled from one another.
router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);
router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.getMonthlyPlan
  );

// let say you live in los angeles, and wanted to find all the tours within a distance of 300 miles.
// so :distance you will put 300 miles, anf then the :lating you will put the coordinate of where you live

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);
// tours-within?distance=233&center=-40,45&unit=mi
// tours-within/233/center/-40,45/unit/mi

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);
router.route('/').get(tourController.getAllTours); // if the user is not authenticated, then there will be an error, and of course then the next middleware (tourController.getAllTours) will not be executed.

router.route('/addPost').post(
  authController.protect,
  authController.restrictTo('admin', 'lead-guide'),
  // tourController.uploadTourImages,
  // tourController.resizeTourImages,
  tourController.createTour
);
// middleware
// router
//   .route('/:id')
//   .get(tourController.getTour)
//   .patch(
//     authController.protect,
//     authController.restrictTo('admin', 'lead-guide'),
//     tourController.updateTour
//   )
//   .delete(
//     authController.protect,
//     authController.restrictTo('admin', 'lead-guide'),
//     tourController.deleteTour
//   );
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = router;
