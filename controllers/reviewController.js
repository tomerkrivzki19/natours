const Review = require('../models/reviewModel');
const AppError = require('../utils/appError');
const factory = require('../controllers/handlerFactory');

//Duplicate code functions

//end points functions

// exports.getAllReviews = async (req, res) => {
//   try {
//     //check if there is a tour id and if there is one - then we will only serch for reviews where the tour is only qual to that tour id
//     //basicly what this options that we added to the funciton saying that if there a tourId inside the req params then find only it , if there no param the filter object will be emptey , and that way it will found us all

//     let filter = {};
//     if (req.params.tourId) filter = { tour: req.params.tourId };

//     const reviews = await Review.find(filter);
//     res.status(200).json({
//       status: 'success',
//       results: reviews.length,
//       data: reviews,
//     });
//   } catch (error) {
//     res.status(404).json({
//       status: 'failed',
//       message: error,
//     });
//   }
// };
exports.getAllReviews = factory.getAll(Review);

// review / rating / createdAt -current time stamp/ ref to tour -review that the tour belong to / ref to user  the user who wrote this revie

exports.createReview = async (req, res) => {
  try {
    //ALLOW NESTED ROUTES -> deinf the routes endpoint when they not specify in the req.body
    //if we didnt specify the tour id in the bodt we want to defind it s the one that coming from the url
    if (!req.body.tour) req.body.tour = req.params.tourId;
    //the same with the user
    if (!req.body.user) req.body.user = req.user.id; //the user data from the req

    const newReview = await Review.create(req.body);

    console.log(newReview);
    res.status(201).json({
      status: 'success',
      data: {
        review: newReview,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'failed',
      message: error,
    });
  }
};
//MIDDLE WARE FOR CREATING REVIEW BECOUSE WE ARE USING THE FACTORY method
exports.setTourUserIds = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
