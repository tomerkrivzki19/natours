const express = require('express');
const viewController = require('../controllers/viewController');
const router = express.Router();
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');
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

router.get(
  '/',
  bookingController.createBookingCheckout, //temporary intill we upload the site to the cloude
  authController.isLoggedIn,
  viewController.getOverview
);
router.get('/tour/:slug', authController.isLoggedIn, viewController.getTour);
router.get('/login', authController.isLoggedIn, viewController.getLoginForm);
router.get('/me', authController.protect, viewController.getAccount);
router.get('/my-tours', authController.protect, viewController.getMyTours);

router.post(
  '/submit-user-data',
  authController.protect,
  viewController.updateUserData
);

module.exports = router;

// TASKS:
// mission: create a /login route => controller => tamplate - (the tamplate located at the tamplate folder named login tamplate )
