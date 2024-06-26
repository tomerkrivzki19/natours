const express = require('express');
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');

const router = express.Router();
//TESTING :

// router.get('/', (req, res) => {
//   res.setHeader('Origin-Agent-Cluster', 'require=origin');

//   //render() -> will render the name that we passed in
//   res.status(200).render('base', {
//     //in order to pass data to the tamplate here , we need to open an opject option and from there we can pass data ,this data will be availble in the pug tamplate
//     tour: 'The Forest Hiker',
//     user: 'Jonas',
//     //this veribales that we pass in here called locals in the pug filles
//   });
// });

// router.use(authController.isLoggedIn);

//middleware for alerts:
router.use(viewController.alerts);

router.get(
  '/',
  //bookingController.createBookingCheckout, //temporary intill we upload the site to the cloude
  authController.isLoggedIn,
  viewController.getOverview
);
router.get('/tour/:slug', authController.isLoggedIn, viewController.getTour);
router.get('/login', authController.isLoggedIn, viewController.getLoginForm);
router.get('/singup', authController.isLoggedIn, viewController.getSingupForm);
router.get('/me', authController.protect, viewController.getAccount);
router.get('/my-tours', authController.protect, viewController.getMyTours);

router.get('/my-reviews', authController.protect, viewController.getMyReviews);
router.get(
  '/manage-tours',
  authController.protect,
  viewController.getManageToursDisplay
);
router.get(
  '/manage-tour/:slug',
  authController.protect,
  viewController.getTourDetaillsAdministrator
);
router.post(
  '/my-favorites',
  authController.protect,
  viewController.getMyFavorites
);

router.post(
  '/submit-user-data',
  authController.protect,
  viewController.updateUserData
);

module.exports = router;

// TASKS:
// mission: create a /login route => controller => tamplate - (the tamplate located at the tamplate folder named login tamplate )
