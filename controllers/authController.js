const crypto = require('crypto');
const { promisify } = require('util'); //a build in promisify function is in node libary -> make it return promise.
//es6-distructaring
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
//const catchAsync = require('../utils/catchAsync'); // a function that we made instead of trycatch
const AppError = require('../utils/appError');
const Email = require('../utils/email');

// A global jwt creation function, to save us some time
const signToken = (id) => {
  //           the user is that was created     THE secret key we generated
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    //the settings to the jwt
    expiresIn: process.env.JWT_EXPIRING_IN, //the expiring time that we have set inside of the proccess.env
  });
};
// a function that will create and send us token if the user finished the proccess
// we doing it becouse we see that this proccess is reapets itself each and each time , this is why we creating this function to make us a shortcut and by doing that make our code lokke more arregend
const createSendToken = (user, statusCode, req, res) => {
  //                user ->  the user argument!
  const token = signToken(user._id);

  //Send cookie
  const cookieOptions = {
    //             the day now  + the 90 we set on config.env -> covert it to miliseconeds
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ), //the broswer and the client cookie will delete itself after it expires

    //  secure: true, //the cookie will be only send on encrypted connection - HTTPS
    httpOnly: true, //thehe cookie cannot be access or modifyed in any way by the browser, t way the broswer act after we set that option is to recive the cookie store it and send it automaticlly along with every reqeuset
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    //we need to trust proxys inside app.js => app.enable('trust proxy)
  };

  // secure: (explenation)

  //when we are at production the cookie can only be send on a secured connection ,on https connection
  // if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  //the problem with that is does not meand that connection is actually secure , becouse not all deployed aplications are automatically set to https,
  //in express we have a secure proparty on the request that is added only when the conection is secure then the req.secure return true
  //                on heroku its not work and here the solution

  // if (req.secure || req.headers['x-forwarded-proto'] === 'https')
  //   cookieOptions.secure = true;

  //so we can move it to the oprions aboce when sending the cookie , instead of making a if statement for that

  //the name of the cookie , the data we sending , options :
  res.cookie('jwt', token, cookieOptions);

  //Remove the password from the output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user, // user ->  the user argument! | user = user
    },
  });
};
const createSendTokenVerification = (user, statusCode, req, res) => {
  //                user ->  the user argument!
  const token = signToken(user._id);

  //Send cookie
  const cookieOptions = {
    //             the day now  + the 90 we set on config.env -> covert it to miliseconeds
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ), //the broswer and the client cookie will delete itself after it expires

    //  secure: true, //the cookie will be only send on encrypted connection - HTTPS
    httpOnly: true, //thehe cookie cannot be access or modifyed in any way by the browser, t way the broswer act after we set that option is to recive the cookie store it and send it automaticlly along with every reqeuset
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    //we need to trust proxys inside app.js => app.enable('trust proxy)
  };

  //the name of the cookie , the data we sending , options :
  res.cookie('jwt', token, cookieOptions);
  res.status(statusCode).render('emailVerification');
};
exports.singup = async (req, res, next) => {
  try {
    //* this setup is saying that we can sighn in as admin , it also make every person that will try to connect as admin
    //const newUser = await User.create(req.body); // in here we are passing an object with the data to the user that we are creating
    //* this setup will make sure that only real person can connect not as admins , and if we want to connect as admin , ve can basicly create us an user in mongoose and use it from there
    const newUser = await User.create(req.body); //check if works becouse i have change the settings to the origina setting ( data) that sended to the db

    // url => we want to point the user to the account page
    // const url = 'http://127.0.0.1:8000/me';
    //we could leave it like this but this will only work on development and not in a prudoction mode, becouse this url does not exist when we are in production, instead of hardcoding this like this we can get that type of data from the requst!
    //we can get from the req the protocol we using (http / https) and also we can get from the request also the host (127.0.0.1:8000)
    const url = `${req.protocol}:${req.get('host')}/me`;
    // console.log(url);

    await new Email(newUser, url).sendWelcome();

    createSendToken(newUser, 201, req, res);

    // const token = signToken(newUser._id);

    // res.status(201).json({
    //   status: 'success',
    //   token,
    //   data: {
    //     user: newUser,
    //   },
    // });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    //1) Check if email and password is exist
    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }
    //2) Check if user exist  && password is currect
    //                        the field+the verible , we need to put + and then the name of the verible to the selcet to work
    const user = await User.findOne({ email }).select('+password'); //selcet the fields from the db that we need
    //*we finding by email and not by id
    //(we comparing the byctpy package in the model , becouse there we have the package imported and also it related to the data so we implemnting this there )
    //const correct = await user.correctPassword(password, user.password); //this will be eidegher true or false --> we moved this verible becouse eiegher way if there no user.password it will not pass, so we saved some code here..

    if (!user || !(await user.currectPassword(password, user.password))) {
      //in this vake this is vake , we not specify what is incorrect for security methods
      return next(new AppError('Incorrect email or password ', 401));
    }

    //3) If everything ok, send token to client

    createSendToken(user, 200, req, res);
    // const token = signToken(user._id);
    // return res.status(200).json({
    //   status: 'success',
    //   token,
    // });
  } catch (error) {
    next(error);
  }
};

//if we want to keep using the super secure way of storing cookies, so how we could be abale to log out users on our website?
//  becouse usually with jwt authentication we just delete the cookie or the token form the local storage, but its not possible when we using this way ( httpOnly:true in the cookie options --> secure way of working with cookies )
// what we are going to do insted is to create a very simple logout route that will simply send back the new cookie with the exact same name but with out the token and that will overwrite the new cookie that we got in the browser with one that have the same name but not token
// and so that when the cookie send with the next request , then we will not be abale to identify the user as beaing log in => what will log him out + adding some experation time to cookie to make it disapere
exports.logout = (req, res, next) => {
  try {
    res.cookie('jwt', 'loggedout', {
      //the day now + 10 sec -> this will expired after the function have operated , menaning that it will remove the cookie completely after 10 sec
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });
    res.status(200).json({ status: 'success' });
  } catch (error) {
    next(error);
  }
};
// refresh token
//a middleware function that will check if the token valid and protect the routes that we selceted
exports.protect = async (req, res, next) => {
  try {
    //1) Getting token and check if its there,        startsWith-> js function that check the first lorem of the sentence
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      //now we need to split between the Bearer and the actual tooken in order to get access to the actual token that has been sent to us from the req.headers
      token = req.headers.authorization.split(' ')[1]; //we want the seconed element from the array
    } else if (req.cookies.jwt) {
      //read the json web token form a cookie
      token = req.cookies.jwt;
      //authenticate users also by the cookie not only by the authorizaation req header
    }

    // console.log(token);
    //check if the token exist :
    if (!token) {
      req.user = null;
      res.locals.user = null;
      return next(
        new AppError('You are not logged in! Please log in to get access.', 401)
      );
    }

    //2) Validate token - verification
    //[ a function that we need to call  whitch then return a promise  ] || [  in here we actually caliing the function ]
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET); //promisify-> a build in function in node libary -> make it return promise.
    // console.log(decoded); // in here we getting the current use id from db , and also we geting the date it was created and the expring time
    //for exmaple : { id: '66082d7512571462f0d9ffe9', iat: 1712842541, exp: 1720618541 } -> this what we geting from decoded after getting an access to protected route
    //this id is matching to the user id in compass

    // TODO: !!!! Message !!!!
    //instead of doing tryblock to decoted , we doing in this proccess :
    //  we specify in the err handeler middleware that if there an JsonWebTokenError ,(like fake one , invalid one ) on prod mode then it will display to the client an nice envalid message
    //                      -------------------------               ------------------------------------------------                       -----------------------------------------------------

    //---! for more security cheking examples:
    //3) Check if user still exist
    // *  what if the a user has been deleted and in the meanwhile the token still exist  , if there no user we dont want him to log in
    // * what if the user hase changes his password after the token has been issued
    // * someone stole the jsonwebtoken from the user and the user in order to protect from that ,changes his password - the token that has benn giving before the password chanhged need to be issued
    // query the user by id
    const currentUser = await User.findById(decoded.id); // finding the user in the db by it id -> serching the user by the id of the decoded

    // if there no id that match in the decoded to the db then log him out with an err message
    if (!currentUser) {
      req.user = null;
      res.locals.user = null;
      return next(
        new AppError(
          'The user belonging to this user does not longer exist. ',
          401
        )
      );
    }
    //4) Check if user changed password after the token was issued
    //* to check that we will create a new instance method that will be isuued for all documents in the model  , documents are instanses of a model

    //                 iat: 1712842541 like in the exmple above
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      // * if the user is actualy changed their password so then we want this err to happen
      // * if the password was actually changed so we want an error
      req.user = null;
      res.locals.user = null;
      return next(
        new AppError(
          'User recently changed password! Please log in again.',
          401
        )
      );
    }

    //GRAND ACCESS TO PROTECTED ROUTE
    // put the intire user data on the req:
    req.user = currentUser; // we puting inside req.user the new user data!, that way the data will be avaible in next middleware function , this req bject travels from middleware to middleware
    res.locals.user = currentUser; //we puting both current user inside req.user and res.locals.user , so we can automaticly use that on all tamplates when we want

    next();
  } catch (error) {
    next(error);
  }
};

//Only for renderd pages, no errors!
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      //1)verify the token
      const decoded = await promisify(jwt.verify)(
        //promisify-> a build in function in node libary -> make it return promise.
        req.cookies.jwt, // refresh token
        process.env.JWT_SECRET
      );

      //2)Check if the user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      //3) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // THERE IS A LOGGED IN USER
      //we can get access to response.locals and set there any verible we want and from there our pug tamplates will get access to them ,
      //in req.locals.user there will be an tampalte there will be a verible called user => each an every pug tamplate will get access to response.locals.user
      //passing data to a tamplate using a render function
      res.locals.user = currentUser;
      return next();

      //NO looged in user
    } catch (error) {
      return next();
    }
  }
  next();
};

// Authorization
//exampe for explalation -> deleting a tour from db , not every user shuld be allowed to that even if the user login
//to that we need to authorization only types of user that could to surten actions

//Authorization-- verifying if surten users have the rights to interact with surten resourse(even if login!).

//here we need a way of passing arguments to middleware function!
//the solution to that is to create a wraper function whitch then return the middleware funtion that we actully want to create

//   ...roles-> will create an array of all arguments that was specified
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    //roles ['admin' , 'lead-guide'] => we will give access when this type of role are passed in
    //role = 'user' => not contains in this array so the 'user' will not ger prommision
    // the code for that :

    //the type of rolde is included inside the req becouse on protect middleware we stored the current user inside the req, in the middleware below
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('you do not have promission to preform this action ', 403) //403-> forbiten
      );
    }
    //if included  =>
    next();
  };
};

//user friendly password functionality                            TODO:
//setp 1:
//user send post req to forget password route only with email adress
// then it will create a reset token and send that to the eamil that was provided (simple random token not a json web token  )
//

exports.forgotPassword = async (req, res, next) => {
  try {
    //1) Get user based on POSTed email
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return next(new AppError('There is no user with email adress', 404));
    }

    //2) Generate the random token
    //need to create instance with the user data - inside the user model

    const resetToken = user.createPasswordResetToken(); //modifiay the data
    //validateBeforeSave: false ==> de-activate all the validators that we have set in our schema -> in here its avoiding problems becouse there no need in the requirments that we set in the schema
    await user.save({ validateBeforeSave: false }); //now we need to save it

    //3) send it to user's email
    try {
      const resetURL = `${req.protocol}://${req.get(
        'host'
      )}/api/v1/users/resetPassword/${resetToken}`; //the user click on the email and then she will be abale to do the req from there , we will duplicate that when we nuild our dynamic website

      //const message = `Forgot your password? submit a PATCH request with your new password and passwordconfirm to: ${resetURL}.\nif you didn't forget your password, please ignore this email!`;

      //there a way that the sendEmail progress will not succed so there for we want to make more then sending just a err message, we need to set back the password reset token and the password perset exxpired that we defind
      //the sendEmail function is a a-sync function and also she contain an options inside her

      // await sendEmail({
      //   email: user.email, // : req.body.email ->  exactly the same
      //   subject: 'Your password rest token (valid for 10 min)',
      //   message,
      // });

      //The New Email constructur method
      await new Email(user, resetURL).sendPasswordReset();

      return res.status(200).json({
        status: 'success',
        message: 'Token sent to email',
        //we are not puting the token here becouse this is not secured and we dont want anybody to detect the token that way the could not hacked the account
      });
    } catch (error) {
      user.passwordResetToken = undefined; // reset both token and expired proparties
      user.passwordResetExpiers = undefined;
      await user.save({ validateBeforeSave: false }); // to save the proccess

      return next(
        new AppError('There was an error sending the email.  Try again later!'),
        500
      );
    }
  } catch (err) {
    next(err);
  }
};

//step 2:
// the user sends that new token from his email with a new password in order to update his password

exports.resetPassword = async (req, res, next) => {
  try {
    //1) Get user based on the token  -
    // incrypted the original token again so we can compare it  with the one that stored in the db, that is also incrypted

    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token) // the path /resetPassword/:token --
      .digest('hex');

    //get the user -this token is the only thing that can get us access to that user
    const user = await User.findOne({
      passwordRestToken: hashedToken, // we loking for the hash token here that the user set on the url
      passwordResetExpires: { $gt: Date.now() }, //we want to check if the passwordResetExpiers proparty is greater then now , becouse if the passwordResetExpiers date is greater then now it means tha in the futuer it hasent been expired
      //mongo db will convert everything to the same and there for will be able to copmare them acurdly
    });

    //* in this procees we cheking the user fot the token and also check if the token has not been yet expired

    //2) If token has not expired, and there is user, set the new password
    //here we want to send a err if there not user and also the token has been expired

    if (!user) {
      return next(new AppError('Token is invalid or has been expired', 400));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordRestToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save(); // save the proccess

    //3) Update changedPasswordAt property for the user

    //4) Log the user in, send JWT
    createSendToken(user, 200, req, res);

    // const token = signToken(user._id);

    // return res.status(200).json({
    //   status: 'success',
    //   token,
    // });
    //after that step the passwordResetExpiers & passwordResetToken is not deleted from db , check it out -> but it bloking after time out so we good for now
  } catch (error) {
    next(error);
  }
};

exports.updatePassword = async (req, res, next) => {
  try {
    //we need the user to pass his current password for security matters
    //exmaple -> if someone enter tour computer when the computer is on and change the password , then is could be wrong , to avoid thos kind og situation we need to make sure that the user put his password first and from there to continue
    //1)Get the user from collection
    //                               .select => when we finding the user by it own id we want also to bring his password on the result
    const user = await User.findById(req.user.id).select('+password'); // we find by the req id becouse in this endpoint the user is already log in , and in the end points beloow  we defind that the user data is proccess threw the req
    //2) Check if POSTed  current password is correct
    //  const passwordCheck =   user.currectPassword(req.body.passwordConfirm, user.password);

    if (
      !(await user.currectPassword(req.body.passwordCurrent, user.password))
    ) {
      return next(
        new AppError('The current password that provided is wrnog!', 401)
      );
    }
    //3) If so , update the passsword
    user.password = req.body.password; // seting the password inside the db , to the password that the user provided
    user.passwordConfirm = req.body.passwordConfirm; //seting the passwordConfirm inside the db , to the passwordConfirm that the user provided
    await user.save(); //saving the proccess inside the DB
    //4) Log user in , send JWT
    //                      the id from the user , at the first line we found the user id , when we was serching for the user password
    createSendToken(user, 200, req, res);

    // const token = user.signToken(user.id);
    // res.status(200).json({
    //   status: 'success',
    //   message: 'The password successfully updated',
    // });
  } catch (error) {
    next(error);
  }
};

//confirm email
exports.confirmEmail = async (req, res, next) => {
  try {
    //1) Get user based on POSTed email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return next(new AppError('There is no user with email adress', 404));
    }

    //2) Generate the random token - WE ARE USING THE PASSWORD TOKEN METHODS TO SET EXPIRED TIME TO THE CURRENT TOKEN
    const resetToken = user.createConfirmEmailToken(); //modifiay the data
    //validateBeforeSave: false ==> de-activate all the validators that we have set in our schema -> in here its avoiding problems becouse there no need in the requirments that we set in the schema
    await user.save({ validateBeforeSave: false }); //now we need to save it

    try {
      const url = `${req.protocol}://${req.get(
        'host'
      )}/api/v1/users/confirmEmail/${resetToken}`; //the user click on the email and then she will be abale to do the req from there , we will duplicate that when we nuild our dynamic website

      await new Email(user, url).sendEmailConfirm();

      return res.status(200).json({
        status: 'success',
        message: 'Token sent to email',
        //we are not puting the token here becouse this is not secured and we dont want anybody to detect the token that way the could not hacked the account
      });
    } catch (error) {
      user.confirmEmailToken = undefined; // reset both token and expired proparties
      user.confirmEmailExpires = undefined;
      await user.save({ validateBeforeSave: false }); // to save the proccess
      return next(
        new AppError('There was an error sending the email.  Try again later!'),
        500
      );
    }
  } catch (err) {
    next(err);
  }
};
exports.confirmEmailUpdate = async (req, res, next) => {
  try {
    //1) Get user based on the token  -
    // incrypted the original token again so we can compare it  with the one that stored in the db, that is also incrypted
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token) // the path /resetPassword/:token --
      .digest('hex');

    //2) If token has not expired, and there is user, set the new password
    //here we want to send a err if there not user and also the token has been expired
    const user = await User.findOne({
      confirmEmailToken: hashedToken, // we loking for the hash token here that the user set on the url
      confirmEmailExpires: { $gt: Date.now() }, //we want to check if the passwordResetExpiers proparty is greater then now , becouse if the passwordResetExpiers date is greater then now it means tha in the futuer it hasent been expired
      //mongo db will convert everything to the same and there for will be able to copmare them acurdly
    });

    if (!user) {
      return next(new AppError('Token is invalid or has been expired', 400));
    }

    //3) Update settings property for the user
    user.verifiedEmail = true;
    user.confirmEmailToken = undefined;
    user.confirmEmailExpires = undefined;

    await user.save({ validateBeforeSave: false }); // save the proccess

    //4) Log the user in, send JWT
    createSendTokenVerification(user, 200, req, res);
    // res.status(200).render('emailVerification');

    //after that step the passwordResetExpiers & passwordResetToken is not deleted from db , check it out -> but it bloking after time out so we good for now
  } catch (error) {
    next(error);
  }
};
