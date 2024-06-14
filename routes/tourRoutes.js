const express = require('express');
const tourControllers = require('../controllers/tourControllers');
const authController = require('../controllers/authController');
// const reviewController = require('../controllers/reviewController');
const reviewRouter = require('../routes/reviewRoutes');
// we could also make a shortcut by destractaring the callbacks when importing them from exports
// const {getAllTours,createTour,getTour, updateTour, deleteTour } = require('../controllers/tourControllers');
// this will short us when we applyig the callback to the route.

// a shorter way to make the code look more arragend
const router = express.Router();

//FIXME: this implementation here is ok for the functianlity but wrong for orderig the code ,
// the explanation for that is , that the end point is connect to the tour model , but is taking from the review model,
//to make the code a ordered curractly we must insure that everthing is connected to each other , that way our code is anderstandibale and readible to the next programers that will use our apllication , and mybe aslo to our sellf
//for that we need to implement is a stargety that says --> the tour router should use the review router encase he encounter a route like this ( /:tourId/reviews ):

// //req end-point for creating a new review to the tour id
// //           Tour id
// //POST /tour/2asd1ad/reviews -> child of tours -> create a review by the path tour id
// //GET /tour/2asd1ad/reviews  -> get us all the reviews of this tour
// //GET /tour/2asd1ad/reviews/ads4ad -> id of the review -> get a review specific review by his id from the tour id

// router
//   .route('/:tourId/reviews')
//   .post(
//     authController.protect,
//     authController.restrictTo('user'),
//     reviewController.createReview
//   );

//router =>  middle-ware
router.use('/:tourId/reviews', reviewRouter);
//the proccess behinf it:
//when the path will get to the code , it first will turn to the tour router becouse of the path (" api/v1/tours/5c88fa8cf4afda39709c2955/reviews"),
// from the tour router it will come to here , and from here it will go back and proccess to the review router
//that way we can insure the order and the connection in out code FIXME:

//middleWare indise the route
//*id there is no param the code will ignore that middale wahre and move on
// router.param('id', tourControllers.checkId);
router
  .route('/top-5-cheap')
  .get(tourControllers.aliasTopTours, tourControllers.getAllTours);

router.route('/tour-stats').get(tourControllers.getTourStats);
router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourControllers.getMonthlyPlan
  );

//to get the tours that near the client options
router.route('/distances/:latlng/unit/:unit').get(tourControllers.getDistances);

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourControllers.getTourWithin);
// /tours-within?distance=233&center=-40,45,unit=mi    | mi => miiles : km => killometers
// /tours-within/233/center/-40,45/unit/mi ---- > we pick that one becouse its looks more cleaner

// api/v1/tours'
router
  .route('/')
  .get(tourControllers.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourControllers.createTour
  );
// tourControllers.checkBody -- > exmaple of middleware
router
  .route('/:id')
  .get(tourControllers.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourControllers.uploadTourImages,
    tourControllers.resizeTourImages,
    tourControllers.updateTour
  )
  .delete(
    //a middleware function that check if there valid JWT
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'), // user-roles
    tourControllers.deleteTour
  );

module.exports = router;
