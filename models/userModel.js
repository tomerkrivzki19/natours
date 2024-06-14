const crypto = require('crypto'); //build in node moudle , make us very simple bites random
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'please tell us your name '],
  },
  email: {
    type: String,
    required: [true, 'please provide us your email'],
    unique: true, //no accounts with the same email adress
    lowercase: true, //transform the email to lower case,
    validate: [validator.isEmail, 'Please provide a valid email'], //validate the email adress jhonas@gmail.com --make sure that the email currect -for that we need to use a validator from npm package
    //         an validaor for emails from the package of validator - check the package in npm for more validaor options
  }, //                     the default image from our folder
  photo: { type: String, default: 'default.jpg' }, //optional in our app
  role: {
    //for Authorization!
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'], //user roles that will be specific to apllication domain,
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password '],
    minlength: 8, //need to have at-lease 9 characters
    select: false, //automaticly will not showed up in any output
  },
  passwordConfirm: {
    // on new account we need to make sure that the password is currect
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      //This only works on CREATE and SAVE ! example: User.creare(req.body) || User.save(req.body) -> we can use that in order to update a user
      validator: function (el) {
        return el === this.password; //abc ===  abc => will return true , if abc === ayz will return false and then we will have a validation err
      },
      message: 'Password are not the same',
    },
  },
  passwordChangedAt: Date,
  passwordRestToken: String,
  passwordResetExpires: Date, //you have limited time to rest your password as security mesures
  active: {
    //
    type: Boolean,
    default: true, //by defult -> any user that is new is an active user
    select: false, // we dont want to display it in the output , we dont want to show this active flag
  },
});
//middleware function that will be proccess between the moment that we recive the data , and proccesing to the db
userSchema.pre('save', async function (next) {
  //  Only run this function if password was actualy  modified

  //only when the password is changed and also when it created new - if the user is updating we will not want to incrip the password again
  //method that we can use when a surten field if modified then do the next code...
  if (!this.isModified('password')) return next(); //if the password hase been not modified then go to the next function

  //Hash the password with cost of 12

  //else:   hash=> incriptation -> also an async version that return promise that we need to await
  // bcrypt - > this algoritem will first solve and then hash our passport in order to make it realy strong from brudal attacks
  this.password = await bcrypt.hash(this.password, 12); // we want to set our password to incrypt version of 12 - not to make it to easy to break the password but also not to make our application take to long before incrypt the password

  //Delete passwordconfirm field
  this.passwordConfirm = undefined; // delete a field to not procceeded in the db
  //we need this password confirm onlt to the validation , to make sure the user not doing a mistake while setting a password
  //we set the password in the schmema as required , but ut required only on the input not in the db
  next();
});

//this function here going to run right before a new document is actualy saved, we could put it inside contorllers but we want it to happend automatically-happening behind the sence .
userSchema.pre('save', function (next) {
  //           the name of the proparty |this.isNew -> if the document is new
  if (!this.isModified('password') || this.isNew) return next(); // if we dont modify the password proparty then not manipulate the passwordChangeAt!

  this.passwordChangedAt = Date.now() - 1000; //put the passwordChangeAt one seconed in the past ->insure that the token is made after the password has been changed
  next();
});

//QUERY MIDDLEWARE | /^ / => meaning , find every thing that starts with find, we implement that becouse we need to query also for update and more , so the solution to that is to make this sing , to query all that starts with find

userSchema.pre(/^find/, function (next) {
  // this function need to hide from the user all the users that have active set to false
  // this points to the current query
  //               $ne - not equal!
  this.find({ active: { $ne: false } }); // we want to query all the documnets that have active set to true.
  next();
  // in this exmaple we shwoing a way of "deleting" documents,  we dont delete them copletly we just hide them in the output ! , meaning they no longer active
});
//check if the password is match  - bycrypt
//-here we creating a methood that will be aviable on all documents of a surten collection
//              the name of the funciton
userSchema.methods.currectPassword = async function (
  candidatePassword,
  userPassword
) {
  // this.password -> will not wotk becouse we select the password select to false in the schema
  return await bcrypt.compare(candidatePassword, userPassword);
};
//                     the time stand that say when the token has been isuued
userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
  //now we need to create an field in our schema for the date that password hase been changed
  if (this.passwordChangedAt) {
    //we getting the passwordChangedAt in milliseconed, so for that we need to covert it that way it will be comparibale
    const changedTimeStemp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10 // base ten(10) numbers
    ); //getTime -> The getTime() method of Date instances returns the number of milliseconds for this date since the epoch, which is defined as the midnight at the beginning of January 1, 1970, UTC.  ,parseInt=> The parseInt() function parses a string argument and returns an integer of the specified radix (the base in mathematical numeral systems).
    // console.log(changedTimeStemp, JWTTimeStamp);
    return JWTTimeStamp < changedTimeStemp; //      100           <          200              => means we changed the password after the token was issued so there for that will return true , if the  (issued at)-time  bigger then the  changed the password (time) then it will return false
    //                                      iat (issued at)-time | changed the password (time)
  }

  // fALSE MEANS NOT CHANGED !!

  //if passwordChangedAt is not exist then it means that the user hase never changed his password
  return false; //the user hase not changes his password after the token has benn isuued
};

// Generate the random token for forget password
userSchema.methods.createPasswordResetToken = function () {
  //                  (the num of charcters) | 'hex' => option in tostring method
  const restToken = crypto.randomBytes(32).toString('hex'); //this token is what we are going to send to the user , it will be like a password that the user could use to create a real new password, only the user have access to this token so it realy behave like a password
  //i this token behave like a password ,it means that hacker the have accesss to that token can actually reset the user passwoed itself meaning we dont want to have it stored anywhere without hashing it ,its incrypted!

  // we want to save it inside the db to copmare it with the token that the user provide
  // (we impelemnting that inside the modelschema above)
  this.passwordRestToken = crypto
    .createHash('sha256') // algoriton
    .update(restToken) // verible where the token is stored
    .digest('hex');
  // "לְעַכֵּל"
  //                             the incrypted one
  // console.log({ restToken }, this.passwordRestToken);
  //                                      add a couple of seconeds
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; //modifiay the data

  //returning the plane text token becouse tis is actually the one we are going to send to the email
  return restToken;
};

//                      we want the model name- User , and created out of the schema that we just created
const User = mongoose.model('User', userSchema);
//THE MODEL VERIBALES ARE ALWAYS WITH CAPITAL LETTER

module.exports = User;
