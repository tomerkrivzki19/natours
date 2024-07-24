const path = require('path'); //a path node module is a package from node that helping us to manipulate paths in node
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet'); // for securing https headers
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParer = require('cookie-parser');
const compresion = require('compresion');
const cors = require('cors');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/clientsRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const bookingContorller = require('./controllers/bookingController');

//tessting
const app = express();

//trust proxys  - for conection secure setting and testing , here is basiclly for heroku becouse heroku works with/as proxy
// app.enable('trust proxy');
app.set('trust proxy', 1); // Trust the first proxy in the chain (Vercel)
//pug --> a tamplate engin for express
//tell express what tamplate engin we are going to use:
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
// console.log(path.join(__dirname, 'views'));

// Global middaleeares:
//Impelement CORS:
//allow all the request
app.use(
  cors({
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
); //return a midddleware function which then add a couple of a diffrent headers to our response
// backend app ,   fronted app
//api.natours.com , natours.com => to allow them both we will use origin:
// app.use(
//   cors({
//     origin: 'https://www.natours.com', //will alow onlt this origin to create reqursts to api.natours.com
//   })
// );
//app.use(cors()) => will only work for simple requests (GET,POST) ,none simple request (PUT,PATCH,DELETE,COOKIE,NONE-STANDART-HEADERS)-called preflight phase
//so when there a non simple requst the browser will automatically issue the preflight phase,and this is how its work , before the real request is actually happens ,for example delete request, the browser first does an options request in order to figure out if the actuall request is safe to send
//we need to actually response to the options request , and options is really just another HTTP method , what its means that when we get an options request to our server , we need to send back the same Access-Allow-Origin header.
//this way the browser will then know that the actual request is safe to perfoem and then execude the delete request itself
app.options('*', cors()); //define all the routes
//app.options('/api/v1/tours/:id', cors()); //to a sepsific route

app.use(express.static(path.join(__dirname, 'public'))); // app.use(express.static('./public')); //Serving static files

// app.use((req, res, next) => { // exampe of middaleware
//   console.log('Hello from the middleware function 👋');
//   next();
// });

//set Security HTTP headers
// Further HELMET configuration for Security Policy (CSP) --> for the leaflet package instead of mapbox

app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
  })
);
const scriptSrcUrls = [
  'https://unpkg.com/',
  'https://tile.openstreetmap.org',
  'https://*.cloudflare.com',
  'https://js.stripe.com',

  'https://js.stripe.com/v3/',
  'https://checkout.stripe.com',
];
const styleSrcUrls = [
  'https://unpkg.com/',
  'https://tile.openstreetmap.org',
  'https://fonts.googleapis.com/',
  'https://www.myfonts.com/fonts/radomir-tinkov/gilroy/*',
  'checkout.stripe.com',
];
const connectSrcUrls = [
  'https://unpkg.com',
  'https://tile.openstreetmap.org',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:52191',
  '*.stripe.com',
  'https://*.cloudflare.com',
];
const fontSrcUrls = ['fonts.googleapis.com', 'fonts.gstatic.com'];

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"], // It's a good practice to include 'self' in defaultSrc
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: [
        "'self'",
        "'self'",
        'https://unpkg.com/',
        'https://tile.openstreetmap.org',
        'https://cdnjs.cloudflare.com',
        'https://js.stripe.com/v3',
        "'unsafe-inline'", // Use cautiously
        "'unsafe-eval'", // Use cautiously
        ...scriptSrcUrls,
      ],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", 'blob:'],
      objectSrc: [],
      imgSrc: ["'self'", 'blob:', 'data:', 'https:'],
      fontSrc: ["'self'", ...fontSrcUrls],
      frameSrc: ['*.stripe.com', '*.stripe.network'],
      scriptSrcElem: [
        "'self'",
        'https://unpkg.com/',
        'https://tile.openstreetmap.org',
        'https://cdnjs.cloudflare.com',
        'https://js.stripe.com/v3',
      ],
    },
  })
);

// need to put in the begining becouse this will secure our headers

//Development log-in
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
// console.log(process.env.NODE_ENV);

//Limit requests from same API
//rateLimiter package is an package that block hackers trying shut our server down by sending multiply of requsts by definding how mutch request ther server should talke before dening them
const limiter = rateLimit({
  max: 100, // 100 request
  windowMs: 60 * 60 * 1000, //for 1 hour
  //result : 100 req from that one ip in one hour, when that surten of ip get above 100 req in an hour he will get an err
  message: 'Too many request from this IP, please try again in an hour !',
});

// this middlewate only affect on routes that contain '/api' route
app.use('/api', limiter);
//TODO: ! PAY ATTENTION - THIS CURRENT LIMITER FUNTION MIDDLE WARE IS AVAIBLE FOR ALL THE REQ NOT ONLT FOR THE LOGIN , MEANING WE LINITING our clients in sorten way

//we implement that here becouse in this route we need the body coming with the request to be not in JSON ,otherwise this is not going to be working at all
//ass soon as a request hits this mddleware  app.use(express.json({ limit: '10kb' })); , then it wll parsed to json , meaning we are preventing to access the middleware
//body-parsrer? in order to read HTTP POST data , we have to use "body-parser" node module. body-parser is a piece of express middleware that reads a form's input and stores it as a javascript object accessible through req.body
app.post(
  '/webhook-checkout',
  express.raw({ type: 'application/json' }), //express.raw( ) => inseead of body parser npm pack
  bookingContorller.webhookCheckout
);

//Body parser, reading data from the body into req.body
app.use(express.json({ limit: '50mb' })); //here we set the limit for parsering files to max of 10 kb , what will happeend id there are a file more then 10 kb , simpily he will not be accepted
//an build express package that parse url encoded form, urlencoded is also called on the form way of sending data  is also called urlencoded - what is doing is to parse that type of urlencoded form!
app.use(
  express.urlencoded({
    extended: true,
    limit: '50mb',
  })
);
//cookie-parser => an middleware that parse us all the cookies that come form the request
app.use(cookieParer());

//Data sanitization against NoSQL query injection
// A HACKER METHOD - FIXME:CRAZY - login without knew the email
// on login:
// {
//   "EMAIL":{"$gt": "" }
// "PASSWORD": pass12356
// }

//This methods here will access us as admin to the site, to aviod that we need to implement:
app.use(mongoSanitize()); // this is a function that we call that them will return us a middleware function that then we can use, what the middleware function does is to loook at the req body, req queryString and also req.params and filter out all the dollars sign and dots, y removing them this apparators will no longer work

//Data sanitization against XSS
app.use(xss()); //clean any user input from malicious html code . prevent attacker to put inside inputs some html code that could hack the system, by this middleware we preventing that by converting all the html simbels

//Prevent paramater pollution - clear up the duplicate query string , for example if we have on the url : ?sort=duration&sort=price ==> this will give us an array of two paramters of sort and display eventually an err, this package is preventing that to happen by sorting the last one that has been typed
app.use(
  //there are some proparties that we actually want the duplicate to work , like duration : we want to query proprates wiht duration 5 and 10 for exmaple , so to activate that we can use inside the options the whitelist option, and there get acces to those stuff
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ], //simply array of proparties that we actually aloow to duplicate
  })
); // to prevent

//compresion -> will compress all text files (not included images) that will eventually send to the client , its a part of deploying our website
app.use(compresion()); // will return a middleware function that will then going to compress all the text that send to clients
//basiclly after enableing that when the site deployed , it will take a samller size meaning the site will preforme beeter
//we can look that out and check it in the site , search test gzip compression
//Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  // console.log(req.headers); //access to the req headers
  next();
});

// TODO:
// example of reqest:
// app.get('/', (req, res) => {
//   res
//     .status(200)
//     .json({ message: 'hello from the server side', app: 'Natours' });
// });

// app.post('/', (req, res) => {
//   res.send('You can post to do this endpoint ....');
// });

//TOUTE HANDALERS

// a way to make the code look more arragend;

// app.get('/api/v1/tours', getAllTours);
// app.post('/api/v1/tours', createTour);
// app.get('/api/v1/tours/:id', getTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

//3)d ROUTES

// a shorter way to make the code look more arragend
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  //handle all the urls for untyped correctly urls -- err handaling for mispale paths in node.js
  // res.status(404).json({
  //   status: 'fail',
  //   message: `can't find  ${req.originalUrl} on this server`, //originalUrl--> as the names says this will bring us the url that was reqested
  // });
  //WE BASICLY BUILD A CONSTRUCTOR TO DEAL WITH ALL OF THIS FUNCTION BY BUILDING A NEW ERR WILL CLASS AND CONSTRUCTOR
  // in a way that we want to defind our own err
  // const err = new Error(`can't find  ${req.originalUrl} on this server`); //Error - abuild in err constractur , that inside him we defind an err string that will be displayed inside of the err message
  // err.status = 'fail';
  // err.statusCode = 404;
  //we creating an err and then we defind the status  and the statusCode proparties on it so that our err handaling middaleware can use them on the next step
  //  next(err); //if the next function reciving an argument not metter what will happen the express wil read it as an err -> so what it will do is to skip all the pther middlewers and send an err that we paseed in to the global err handaling middleware that will executed

  //THE USE OF A CONSTRUCTOR
  next(new AppError(`can't find  ${req.originalUrl} on this server`, 404));
});

//all --> for all the urls // * ==> means for all simiilar in react-router

//err handaling middleware
// app.use(globalErrorHandler);
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message,
  });
});

//START THE SERVER
// (inside the server js file)
module.exports = app;

//challenges: (lecture 217)
// *) implement restriction that users can onlt review a tour that they have actually booked 👍
// *) implement nested booking routes , for example getting all the bookigs for a certin tour and getting all the bookings for a certing user based on ids , routes: /tours/:id/bookings and /users/:id/bookings👍
// *) improve tour dates: add a participants and a soldOut feld to each date. a date then bacomes like an instance of the tour. then ,when a user book, they need to select on of the dates. A new booking will increase the number of participants in the date, until it is booked out (participants > maxGroupSize). so when a user wants to book, you need to check if tour on the selected date is still available TODO:
// *) implement advanced authentication features : conform user email, keep users logged in with refresh token ,two-factor authentication - when a user logged in they recive a text message to the phonewith a text message that they need to implement to proccied,etc.. TODO:

// *) implement a sign up form , similar to the login form 👍
// *) on a tour detail page, if a user has taken a tour , allow them add a review directly on the website. Implement a from for this -> need to check if the logged in user has actually booked the current tour and  also if the time of the tour has already passed and if so we can add a form to the page that the user can then add a new review for example using our review API 👍
// *) hide the entire booking section on the tour detail page if current user has already booked the tour   (also prevent duplicate bookings on the model ) => 👍
// *) implement "like tour" functionality, with favourite tour page 👍
// *) on the user account page, implement the "My Reviews" page , where all reviews are displayed , and a user can edit them. (if you know React, this would be an amazing way to use the Natours API and train your skills! )👍
// *) For the administrators, implement all the "Manage" pages,where they can CRUD(create,read,update,delete)tours,users,reviews and bookings.
// *)

//MORE ARREGEND :
// CHALLENGES API

// - Implement restriction that users can only review a tour that they have actually booked;
// - Implement nested booking routes: /tours/:id/bookings and /users/:id/bookings;
// - Improve tour dates: add a participants and soldOut field to each date. A date then becomes an instance of the tour. Then, when a user boooks, they need to select one of the dates. A new booking will increase the number of participants in the date, until it is booked out(participants > maxGroupSize). So when a user wants to book, you need to check if tour on the selected date is still available;
// - Implement advanced authentication features: confirm user email, keep users logged in with refresh tokens, two-factor authentication, etc.

// CHALLENGES WEBSITE

// - Implement a sign up form, similar to login form;
// - On the tour detail page, if a user has taken a tour, allow them add a review directly on the website. Implement a form for this.
// - Hide the entire booking section on the detail page if current user has already booked the tour(also prevent duplicate bookings on the model);
// - Implement "like tour" functionality, with fav tour page;
// - On the user account page, implement the "My Reviews" page, wehere all reviews are displayed, and a user can edit them. (If you know REACT, this would be an amazing way to use the Natours API and train your skills!);
// - For administrators, implement all the "Manage" pages, where they can CRUD tours, users, reviews and bookings.

//piblish the code when redirected to a new branch on git and folder ( as a new project) and deploy the web on vercel
