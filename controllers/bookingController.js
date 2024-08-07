const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); //this require will usually exports an function here , then we can simpaly pass our secret key right into that , and that will then give us an stripe object that we can work with

const sharp = require('sharp');
const multer = require('multer');
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const APIFeatures = require('../utils/apiFeatures');
const factory = require('../controllers/handlerFactory');
const appError = require('../utils/appError');

exports.getCheckoutSession = async (req, res, next) => {
  try {
    const { tourId } = req.params;
    const { tourDate } = req.body;

    const dateToBook = new Date(tourDate);
    //1) Get the currently booked tour
    const tour = await Tour.findOne({
      _id: tourId,
      'startDates.date': tourDate,
    }); //the name we gave it ay the url paramater

    if (!tour) return next(new appError('Tour or Date was not found', 404));

    //check if avaible:
    const startDate = tour.startDates.find((dateObj) => {
      return dateObj.date.getTime() === dateToBook.getTime();
    });

    if (!startDate)
      return next(
        new appError('Date not available , Please choose other dates ', 400)
      );
    if (startDate.soldOut)
      return next(new appError('This current date is sold out 😞', 400));

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
      // success_url: `${req.protocol}://${req.get('host')}/?tour=${
      //   req.params.tourId
      // }&user=${req.user.id}&price=${tour.price}`, //stripe get a get req to that url, this proccess is not secure becouse any one that knews the url can get to that route and book a a tour without having to pay
      success_url: `${req.protocol}://${req.get(
        'host'
      )}/my-tours?alert=booking`, //no from stripe we geting a post req to a diffrent route with a difrrent calback funcitons
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
              images: [
                `${req.protocol}://${req.get('host')}/img/tours/${
                  tour.imageCover
                }`,
              ], //
              description: tour.summary,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        tourDate: dateToBook, // Include the tour date in metadata
      },
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

//a function that create the new booking in the DB - we dont need that enymore becouse we deploy our site to the intarnet and now we are using Stripe WEBHOOKS!
// exports.createBookingCheckout = async (req, res, next) => {
//   //THIS IS ONLY YEMPRARY beccouse it UNSECURE any one can create booking without paying
//   try {
//     //he req.query property allows you to access the query parameters from the URL of an incoming HTTP request.
//     const { tour, user, price } = req.query;
//     //console.log(req.query);
//     //console.log('1:', tour, user, price); //no output for the user

//     //we want to create booking if all of that veribles is avaible
//     if (!tour && !user && !price) return next(); // what is the next middleware? = the next middleware is the end-point that will be hit after the checkout is done , in this case it will be the getOverview page
//     await Booking.create({ tour, user, price });
//     // at this point the next middlewre is basiclly home page , based on this lecture when the site is not depoloyed the success url is conatin with all the data with the tour that was purchest, what makes it in-secure .
//     //next();
//     //to make that based on the situation we can make it mure secure by pathing the url to the regular one , meaning chnging the path to not revel the success url path

//     //redirect => will make a new request to the new url
//     //originUrl => the entire URL basiclly which the req came
//     res.redirect(req.originalUrl.split('?')[0]); // we spilt that with with the question mark becouse the question mark is the devider of what we want to get ( the url we want to pressent to the customer )

//     //summary:
//     //what will be is that when there a new booking the {tour, user, price} is defind , so what is going to happend
//     //is that we will redirect ,( what make the page to render with a new get request to the new url), and after the seconed type it will render and get tot the url with that middlware the tour, user, price will be empty
//     //meaning it will go to the next middleware and not to the success url
//   } catch (error) {
//     next(error);
//   }
// };
const updateParticipants = async (tourId, tourDate) => {
  try {
    const dateToBook = new Date(tourDate * 1000); // Multiply by 1000 to convert seconds to milliseconds

    // Update the participants count
    const result = await Tour.updateOne(
      {
        _id: tourId,
        'startDates.date': dateToBook,
      },
      {
        $inc: { 'startDates.$.participants': 1 }, // Increment participants count
      }
    );

    if (result.nModified === 0) {
      console.log(
        'No document was updated. Either the date is not available or already updated.'
      );
    } else {
      console.log(`Updated participants for tour ${tourId} on ${tourDate}`);
    }
  } catch (error) {
    console.error('Error updating participants:', error);
    throw new Error('Error updating participants');
  }
};
const createBookingCheckout = async (session) => {
  //information about the tour =>  client_reference_id: req.params.tourId => we can get access from there
  const tour = session.client_reference_id;
  //information about the user =>  customer_email: req.user.email,
  const user = (await User.findOne({ email: session.customer_email }))._id; // to get only the id from the output
  // information about the price => unit_amount
  const price = session.amount_total / 100; // to canculate the actual numnber we need to devide the number , becouse now she is in cents
  const tourDateTimestamp = parseInt(session.metadata.tourDate, 10);
  await updateParticipants(session.client_reference_id, tourDateTimestamp);
  await Booking.create({ tour, user, price });
};
exports.webhookCheckout = (req, res, next) => {
  // we using here stripe web-hook way , becouse this is the way to make the site more secure for payment , from the function aboce we can see that if there some hacker that can knew the url , she can basically get the tour wthout paying
  //this for we using webhooks , inside stripe webhooks options we defined a new webjoos
  // Endpoint URL: OUR SITE URL with an end point that then will get a post request and from there we will handle that int his function
  // Events to send: checkout.session.completed => this is the event that we selected to perform , becouse this is all about , after the user paying what going to happend
  // after we definde the route with the edn-point "behind the sence", we nned to handele him , ITS VERY IMPORTENT that the data that comed from stripe will not be parse via json , uderwise this will not work - to prevent that we added the route in the app.js to avoid a expreess.json middleware , and added it a body parser to make it readeible to the node.js file

  //after all of this procccess we getting to this callback function :
  //1)Getting the singature from req headers that stripe send
  const singature = req.headers['stripe-signature']; //when stripe will call our webhook it will add a header ro that request
  let event;
  try {
    //may apered some issues
    event = stripe.webhooks.constructEvent(
      req.body,
      singature,
      process.env.STRIPE_WEBHOOK_SECRET //webhook secret //add to the vercel enviroments veribless !!!!
    );
  } catch (error) {
    //we want to send back error so stripe
    return res.status(400).send(`webhook error: ${err.message}`); //only stripe will recive that error, becouse only stripe is who will actually call the URL
  }

  //                   the type we definde in the stripe deshboard
  if (event.type === 'checkout.session.completed') {
    createBookingCheckout(event.data.object);
    res.status(200).json({ received: true });
  }
};

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
