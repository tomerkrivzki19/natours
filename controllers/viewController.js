const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');

const AppError = require('../utils/appError');
const Review = require('../models/reviewModel');
const { default: axios } = require('axios');
const getMonthlyPlanFeature = require('../utils/getMonthlyPlanFeature');

exports.alerts = (req, res, next) => {
  //a miidleware that checkes if there an succes in order so send to the client alert when the booking is succesed
  const { alert } = req.query; // * what comes after the ? .... | we set that in the booking controoler when the pruchest is succeeded where and which url it will navigate
  if (alert === 'booking')
    //here we set the alerts message in the req.locals , that way we will use that after that in the tamplates (pug)
    res.locals.alert =
      "Your booking was successful! Please check your email for a confirmation. If your booking doesn't show up here immediatly please come back later.";

  next();
};

exports.getOverview = async (req, res, next) => {
  try {
    // How to present all the tours on the main page steps:
    // 1) Get tour data from collection
    const tours = await Tour.find();
    // 2) Build template --> we need to pass all the tours in to the pug page ,and how we do that?
    //we basiclly passing the tours object to the response (see in a example bellow).
    // 3) Render that tamplate using tour data from step 1

    res.status(200).render('overview', {
      title: 'All Tours',
      tours,
    });
  } catch (error) {
    next(error);
  }
};

exports.getTour = async (req, res, next) => {
  try {
    // 1) get the data , for the requested tour (including reviews and guides)
    //the guides is already puplate in the schema ,
    // we need to pupolate the reviews also.

    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
      path: 'reviews',
      fields: 'review rating user',
    });
    if (!tour) {
      return next(new AppError('There is no tour with that name.', 404));
    }

    const dates = tour.startDates.map((el) => {
      return el.date;
    });

    //checking if user have bought current tour at all
    if (res.locals.user) {
      const booking = await Booking.find({
        tour: tour.id,
        user: res.locals.user._id,
      });

      if (booking.length > 0) {
        res.locals.purchest = 'purchest';
      }
    }

    //2) Build tamplate(pug tamplate)
    //3) Render tamplate using the data from step 1
    res.status(200).render('tour', {
      title: `${tour.name} Tour`,
      tour,
      dates,
    });
  } catch (error) {
    next(error);
  }
};

// login
exports.getLoginForm = async (req, res, next) => {
  try {
    res
      .status(200)
      .set(
        'Content-Security-Policy',
        "connect-src 'self' https://cdnjs.cloudflare.com"
      )
      .render('login', {
        title: 'Log into you acoount',
      });
  } catch (error) {
    next(error);
  }
};

exports.getSingupForm = (req, res, next) => {
  try {
    res.status(200).render('singup', {
      title: 'sing-up into you acoount',
    });
  } catch (error) {
    next(error);
  }
};
exports.getAccount = (req, res) => {
  // to get the account page we need simpaly render  the tamplate , we dont need to qery becouse  it already done in the protect middleware
  res.status(200).render('account', {
    title: 'Your account',
  });
};

exports.getMyTours = async (req, res, next) => {
  try {
    //to find all the bookings for the currently logged-in users ,which will then give us a bunch of tours IDs and then we will find those tours with their IDs
    //1) Find all bookings |     tour most be equal to req.user.id ( current user id)
    const bookings = await Booking.find({ user: req.user.id }); //each user have  a user id (in the booking model)

    //2) Find tours with the returned IDs
    //create an array of all ids and then after that query for tours that have one of those id's
    const toursIDs = bookings.map((el) => el.tour); //what it will do ? this will loops through the entire bookings array and on each element and it will grab the el.tour => and in the end we will have a nice array with the tours ID's in there
    //afrer we get the array of all tours ids (toursIDs) , we can get the tours corresponding to those IDs
    const tours = await Tour.find({ _id: { $in: toursIDs } }); //we want to find by id , we can't use findById becouse here we will need a new operator for that,
    //tours - what is going to do? => will select all the tours which have an ID which is in ($in operator) the tourIDs array --> this is a way of doing manualy instead of just foing virtual populate like we did before

    //we sending here the overview pug tamplate ,with new data basically
    res.status(200).render('overview', {
      title: 'My Tours',
      tours,
    });
  } catch (error) {
    next(error);
  }
};

exports.getMyFavorites = async (req, res, next) => {
  const { favorites } = req.body;
  try {
    //1) get the localstorage data threw post req: when clicking button or link need to impelent a solution for displaying the favorites from local storage

    if (!favorites) {
      console.log('favorites not found ');
      return next();
    }

    const tours = await Tour.find({ _id: { $in: favorites } });

    res.status(200).render('overview', {
      title: 'My Favorites',
      tours,
    });
  } catch (error) {
    console.error('Error fetching favorite tours:', error);
    next(error);
  }
};
exports.updateUserData = async (req, res, next) => {
  try {
    //we get an empty fiile -> so to solve that we basiclly added some exprees package middleware that parse for us urlencoded data
    // console.log('UPDATING', req.body);
    //                        (we saved on the req the user data on other requests )
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        name: req.body.name,
        email: req.body.email,
      },
      {
        new: true, //updated document as a result ,
        runValidators: true,
      }
    );
    //what we want to do after we update the data , is to come back to the page (same page ) with the updated data
    //to do that we basiclliy need to render the page again
    res.status(200).render('account', {
      title: 'Your account',
      //need to pass the updated user:
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

exports.getMyReviews = async (req, res, next) => {
  try {
    //1) get data from model - find the req.user.id in the reviews model
    const reviews = await Review.find({ user: req.user.id }).populate('user');

    if (!reviews)
      return next(new AppError(`There no reviews sended,  ${req.user.name} `));

    //2) render the  data on review page
    res.status(200).render('clientReviews', {
      title: 'My Favorites',
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

exports.getManageToursDisplay = async (req, res, next) => {
  try {
    const tours = await Tour.find();

    // Fetch monthly plan data using API call to /api/v1/tours/monthly-plan/:year
    const year = 2021; // Replace with your desired year or logic to determine the year
    const { plans } = await getMonthlyPlanFeature(year);

    res.status(200).render('manageTours', {
      tours,
      plans,
      year,
    });
  } catch (error) {
    next(error);
  }
};

exports.getTourDetaillsAdministrator = async (req, res, next) => {
  try {
    const tour = await Tour.findOne({ slug: req.params.slug });
    const guides = await User.find({ role: ['guide', 'lead-guide'] });

    if (tour) {
      const isEdit = req.query.edit === 'true';

      res.status(200).render('tourOverview', {
        title: 'Update Tour',
        tour,
        isEdit,
        guides,
      });
    }
  } catch (error) {
    next(error);
  }
};

exports.addTourTampalte = async (req, res, next) => {
  try {
    // const id = req.params.id;
    // console.log(id);
    // const guides = await User.find({ role: ['guide', 'lead-guide'] });

    // const createData = req.query.data === 'false';
    res.status(200).render('addTour', {
      // guides,
      // createData,
      // id,
    });
  } catch (error) {
    next(error);
  }
};
exports.addTourTampalteSeconed = async (req, res, next) => {
  try {
    //find the current tour name - params.slug =>   if exist:
    const tour = await Tour.find({ _id: req.params.id });
    // console.log(tour);
    const { slug } = tour[0];

    if (tour) {
      //get the guides from the result
      const guides = await User.find({ role: ['guide', 'lead-guide'] });
      res.status(200).render('addTourContinue', {
        guides,
        id: req.params.id,
        slug: slug,
      });
    }
  } catch (error) {
    next(error);
  }
};

exports.getMnageUsers = async (req, res, next) => {
  try {
    const users = await User.find({});

    res.status(200).render('manageUsers', {
      users,
    });
  } catch (error) {
    next(error);
  }
};
exports.getEditUserForm = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.slug);

    res.status(200).render('editUsers', {
      user,
    });
  } catch (error) {
    next(error);
  }
};
exports.getAddUserForm = async (req, res, next) => {
  try {
    res.status(200).render('singUpUsersAdmin');
  } catch (error) {
    next(error);
  }
};

exports.getAllClientReviews = async (req, res, next) => {
  try {
    //1) get data from model - find the req.user.id in the reviews model
    const reviews = await Review.find();

    if (!reviews)
      return next(new AppError(`There no reviews sended,  ${req.user.name} `));

    //2) render the  data on review page
    res.status(200).render('clientReviews', {
      title: 'Client Reviews',
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllClientBookings = async (req, res, next) => {
  try {
    //to find all the bookings for the currently logged-in users ,which will then give us a bunch of tours IDs and then we will find those tours with their IDs
    //1) Find all bookings |     tour most be equal to req.user.id ( current user id)
    const bookings = await Booking.find(); //each user have  a user id (in the booking model)

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth(); // 0-11
    const currentYear = currentDate.getFullYear();

    const result = bookings.reduce(
      (acc, el) => {
        const bookingPrice = el.price;
        const bookingDate = new Date(el.createdAt);
        const bookingMonth = bookingDate.getMonth();
        const bookingYear = bookingDate.getFullYear();

        // Add to total price
        acc.totalPrice += bookingPrice;

        // Check if the booking date is in the current month and year
        if (bookingMonth === currentMonth && bookingYear === currentYear) {
          acc.currentMonthBookings.push(bookingPrice);
          acc.totalCurrentMonth += bookingPrice;
        } else {
          acc.otherBookings.push(bookingPrice);
          acc.totalOtherBookings += bookingPrice;
        }

        return acc;
      },
      {
        currentMonthBookings: [],
        otherBookings: [],
        totalPrice: 0,
        totalCurrentMonth: 0,
        totalOtherBookings: 0,
      }
    );
    //calculation of yield - Per Month
    function calculateSimpleYield(principal, interestEarned) {
      if (principal === 0 || interestEarned === 0) {
        return 0; // If either principal or interest earned is zero, return 0%
      }
      return (interestEarned / principal) * 100;
    }
    const PRINCIPAL = result.totalPrice; //TOTAL AMOUNT
    const interestEarned = result.totalCurrentMonth; //THE INCOME -- current month

    const yield = calculateSimpleYield(PRINCIPAL, interestEarned);
    console.log(`Simple Interest Yield: ${yield.toFixed(1)}%`);

    //-------------------------------------------------------------------

    //calculation of yield - Per Full year
    function calculateAPY(annualInterestRate, compoundingPeriodsPerYear) {
      const r = annualInterestRate / 100;
      const n = compoundingPeriodsPerYear;
      return ((1 + r / n) ** n - 1) * 100;
    }

    const compoundingPeriodsPerYear = 12; // Monthly compounding
    const apy = calculateAPY(yield, compoundingPeriodsPerYear);
    console.log(`Annual Percentage Yield (APY): ${apy.toFixed(2)}%`);

    res.status(200).render('bookingsManagment', {
      title: 'All Bookings',
      bookings,
      totalPrice: PRINCIPAL.toLocaleString(), //PRINCIPAL - connects as total ammount
      yield, //calculation of yield - Per Month
      apy, //Annual Percentage Yield (APY) -Per Full year
    });
  } catch (error) {
    next(error);
  }
};

//phone authenticator :
exports.getPhoneLogin = (req, res, next) => {
  try {
    res.status(200).render('phoneAuthenticator');
  } catch (error) {}
};
exports.getPhoneAuthenticator = (req, res, next) => {
  try {
    res.status(200).render('phoneVerify');
  } catch (error) {}
};
