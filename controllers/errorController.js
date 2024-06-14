const AppError = require('../utils/appError');
//ERR HANDALING MIDDLEWARE

const handleValidatorErrorDB = (err) => {
  //object.values == loop over an object , the elements of the object and return us an array of a given object
  const errors = Object.values(err.errors).map((el) => el.message);
  //                                        connect all the error messages into one line , period and space ment to separate between all the messages
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};
const handleDuplicateFieldsDB = (err) => {
  //we could also take the name from the name proparty , but for the examle we will do it in the hard way
  //.match  is notworking - not recognized
  //const value = err.message.match(/ (["'])(\\?.)*?\1 /)[0]; // a solution for getting to the current name that we want to take
  const value = err.keyValue.name;
  // console.log('value', value);
  const message = `Duplicate fields value: ${value}. Please use another value! `;
  return new AppError(message, 400);
};

const handleCastErrorDB = (err) => {
  // console.log('handleCastErrorDB function activated'); --> for testing
  //path | value --> the name of the field that was typed in the wrong format- we got that also from postman by typing wrong details
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handaleJWTError = () =>
  new AppError('Invalid token please log in again!.', 401);

const handaleJWTExpiredError = () =>
  new AppError('Your token has expired! please log in again.', 401);

const sendErrorDev = (err, req, res) => {
  //we want to check if the route have an api in it
  //originalUrl => the original utl without the host => will display only the route
  //A) API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }

  //B) RENDERED WEBSITE
  console.log('ERROR 💣', err);
  return res.status(err.statusCode).render('error', {
    //the data we want to send to the pug tamplate
    title: 'somthing went wrong!',
    msg: err.message,
  });
};

const sendErrorProd = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    //A) Operational,trusted error : send message to the client
    if (err.isOperational) {
      // err.isOperational -> the proparty that we set to true inside of the error class that we created
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    // B) Programing or other unknown error: don't leak error details
    //1)Log error
    console.log('ERROR 💣', err);
    // 2)Send generic message
    return res.status(500).json({
      status: 'error',
      message: 'something went very wrong',
    });
  }

  // B) RENDERED WEBITE
  //A) Operational,trusted error : send message to the client
  if (err.isOperational) {
    // console.log(err);
    // err.isOperational -> the proparty that we set to true inside of the error class that we created
    return res.status(err.statusCode).render('error', {
      //the data we want to send to the pug tamplate
      title: 'Something went wrong!',
      msg: err.message,
    });
  }

  //B) Programing or other unknown error: don't leak error details
  //1)Log error
  console.log('ERROR 💣', err);
  // 2)Send generic message
  return res.status(err.statusCode).render('error', {
    //the data we want to send to the pug tamplate
    title: 'Something went wrong!',
    msg: 'Please try again later.',
  });
};

module.exports = (err, req, res, next) => {
  //when there are 4 arguments exprees will regonize it as a err handaler middleware

  // console.log(err.stack); //will basiclly show us where the err happend
  // console.log(process.env.NODE_ENV);
  // console.log(err);
  err.statusCode = err.statusCode || 500; //we defind that the err.statusCode the standart to is the err status code and if there not an err code connected the default will be 500-that means err from the server side
  err.status = err.status || 'error';

  //we sending the same error responses to everyone , the idea in production we want to leak as little information as possible of our error to our clients with nice human messages,
  //in the other hand in on development we want to get as mutch inforamtion as possible, we could print it in the conslole , but we could also send the err deatils to postman
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    //a quick fix for the err not displaying us the error message
    error.message = err.message;
    //the error.name dont work becouse in some reason the err that passed to error veribale do not geting the name verible from the error!
    if (err.name === 'CastError') error = handleCastErrorDB(error);
    //if(message.name === 'CastError') --> this is the err that the client geting in some cases , we got the path to the error from postman by simply wroting wrong / false details
    //console.log('error name:', err.name); //for testig !
    if (err.name === 'ValidationError') error = handleValidatorErrorDB(error);
    //TODO:
    // ERR HANDLER FOR JWT TOKEN MIDDLEWARE:
    if (err.name === 'JsonWebTokenError') error = handaleJWTError();
    // for expired tokens:
    if (err.name === 'TokenExpiredError') error = handaleJWTExpiredError();

    //error handeler for create tour with the same name ,we want to change to context that presented to the client,
    //so in this case what we are doing is to compare the "code": 11000,message from the error it-self
    if (err.code === 11000) error = handleDuplicateFieldsDB(error);

    //chking why the err does not have a message:
    // console.log(err.message);
    // console.log(error.message);
    sendErrorProd(error, req, res);
  }
};
