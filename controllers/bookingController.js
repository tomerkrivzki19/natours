const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); //this require will usually exports an function here , then we can simpaly pass our secret key right into that , and that will then give us an stripe object that we can work with

const sharp = require('sharp');
const multer = require('multer');
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const APIFeatures = require('../utils/apiFeatures');
const factory = require('../controllers/handlerFactory');
const AppError = require('../utils/appError');

exports.getCheckoutSession = async (req, res, next) => {
  try {
    //1) Get the currently booked tour
    const tour = await Tour.findById(req.params.tourId); //the name we gave it ay the url paramater
    //2) Create checkout session
    //*) information about the session itself: | create => we need to await becouse the create is returning a promise becouse its sending an API call (with all the settings)  to stripe , this is for why its a async function that we need to wait
    // const session = await stripe.checkout.session.create({
    //   payment_methods_types: ['card'], // the payment methods we want to use
    //   success_url: `${req.protocol}://${req.get('host')}/`, //the url that wil be called right away when the purchest is succesfull
    //   current_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`, //the page that the user goes if they decided to cancell the payment| {tour.slug} => the tour that was selected previously
    //   customer_email: req.user.email, //we have access to the customers email and so with this we can save the user one step and make the checkout experince mutch smooter| req.user.email => this is a safe route meaning that the user have already detaills in the req
    //   client_reference_id: req.params.tourID, //allow us information about the session that have been created , this will help us to prepare to the next step (use strip webhook to create a new booking ) this one is only works for deployed wesites | req.params.tourId => we need the tour id so for that we taking that from the params (url)
    //   //*)  al the information about the product that the user is about to purchest
    //   line_items: [
    //     {
    //       name: `${tour.name} Tour`,
    //       description: tour.summary,
    //       images: [], //live images we need to get from an actual server
    //       ammout: tour.price * 100, //the price of the product , we have to multiply the product bcouse the ammount is expected in sents
    //       currency: 'usd', //it can only be euro and more that onlt supported by stripe
    //       quantity: 1, //one tour in this case
    //     },
    //   ],
    // });
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      success_url: `${req.protocol}://${req.get('host')}/?tour=${
        req.params.tourId
      }&user=${req.user.id}&price=${tour.price}`, //stripe get a get req to that url, this proccess is not secure becouse any one that knews the url can get to that route and book a a tour without having to pay
      cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
      customer_email: req.user.email,
      client_reference_id: req.params.tourId,
      line_items: [
        {
          price_data: {
            unit_amount: tour.price * 100,
            currency: 'usd',
            product_data: {
              name: `${tour.name} Tour`,
              images: [`https://www.natours.dev/img/tours/${tour.imageCover}`], //
              description: tour.summary,
            },
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
    });
    //3) Create session as response
    res.status(200).json({
      status: 'success',
      session,
    });
  } catch (error) {
    next(error);
  }
};

//a function that create the new booking in the DB
exports.createBookingCheckout = async (req, res, next) => {
  //THIS IS ONLY YEMPRARY beccouse it UNSECURE any one can create booking without paying
  try {
    //he req.query property allows you to access the query parameters from the URL of an incoming HTTP request.
    const { tour, user, price } = req.query;
    //console.log(req.query);
    //console.log('1:', tour, user, price); //no output for the user

    //we want to create booking if all of that veribles is avaible
    if (!tour && !user && !price) return next(); // what is the next middleware? = the next middleware is the end-point that will be hit after the checkout is done , in this case it will be the getOverview page
    await Booking.create({ tour, user, price });
    // at this point the next middlewre is basiclly home page , based on this lecture when the site is not depoloyed the success url is conatin with all the data with the tour that was purchest, what makes it in-secure .
    //next();
    //to make that based on the situation we can make it mure secure by pathing the url to the regular one , meaning chnging the path to not revel the success url path

    //redirect => will make a new request to the new url
    //originUrl => the entire URL basiclly which the req came
    res.redirect(req.originalUrl.split('?')[0]); // we spilt that with with the question mark becouse the question mark is the devider of what we want to get ( the url we want to pressent to the customer )

    //summary:
    //what will be is that when there a new booking the {tour, user, price} is defind , so what is going to happend
    //is that we will redirect ,( what make the page to render with a new get request to the new url), and after the seconed type it will render and get tot the url with that middlware the tour, user, price will be empty
    //meaning it will go to the next middleware and not to the success url
  } catch (error) {
    next(error);
  }
};

//mission answers:
// exports.createBooking = async (req, res, next) => {
//   try {
//     const { tour, user, price } = req.body;
//     if (!tour && !user && !price) {
//       return new AppError('Missing inforamtion! Please complete all ..', 400);
//     }

//     const booking = await Booking.create({ tour, user, price });

//     res.status(200).json({
//       status: 'success',
//       booking,
//     });
//   } catch (error) {
//     next(error);
//   }
// };
// exports.getBooking = async (req, res, next) => {
//   try {
//     const tour = await Tour.findById(req.params.id);

//     if (!tour) return new AppError('no tour was found ', 404);

//     res.status(200).json({
//       status: 'success',
//       data: {
//         tour,
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// };
// exports.updateBooking = async (req, res, next) => {
//   try {
//     const doc = await Booking.findByIdAndUpdate(req.params.id, req.body, {
//       //options for updating - we have used that before
//       new: true,
//       runValidators: true,
//     });

//     if (!doc) return new AppError('No document found with that ID', 404);

//     res.status(200).json({
//       status: 'success',
//       data: {
//         doc,
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// };

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
