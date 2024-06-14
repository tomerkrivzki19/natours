const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true }); //mergeParams -> get accesss to the params from another router - merging the paramaters
//basiclly with that option the path from the tour router for example will saved here and then the  .route('/') here will be counted as the path from the other router !

//we want no one to get/ post / change / delete a review , this is why we want to protect them all (all routes) !
router.use(authController.protect);

router.route('/').get(reviewController.getAllReviews).post(
  authController.protect,
  authController.restrictTo('user'), // only user should post reviews , no guides and not adminisrators
  reviewController.setTourUserIds, // another midlleware function
  reviewController.createReview
);

// Notes :
// admins and users should update or delete
//guides should not added or delete reviews

router
  .route('/:id')
  .get(reviewController.getReview)
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview
  )
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview
  );

module.exports = router;
