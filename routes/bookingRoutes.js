const express = require('express');
const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect);
//this route is not about geting or updating ,creating any bookings , its also will not follow the rest of the end-points ,instead  this route will be only for the client get a ceckout session
router.get(
  '/checkout-session/:tourId', // we want the client to send the id of hte tour that beain book , thats for that we could fill up the scheckout session with  all the data that is nesesary ; such as a tour name ,tour price etc...
  authController.protect,
  bookingController.getCheckoutSession
);
//mission : add all the crud opration for the rest of the code (creating , reading ,updating bookings)

router.use(authController.restrictTo('admin', 'lead-guide'));

router
  .route('/')
  .get(bookingController.getAllBookings)
  .post(bookingController.createBooking);

router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

module.exports = router;
