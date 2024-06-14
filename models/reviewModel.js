//PRATIC SKILLS THAT WE LEARNED INTILL NOW
// task - create a review model ,and this all the proparties we need inside there :
//review / rating / createdAt -current time stamp/ ref to tour -review that the tour belong to / ref to user  the user who wrote this review

//we picked the regular.refering version
const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'You must write a revirew  '],
    },
    rating: {
      type: Number,
      required: [true, 'You must have a rating '],
      min: 1,
      max: 5,
      // enum: [1, 2, 3, 4, 5],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour '],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user '],
    },
  },
  {
    //options to the schema
    //waht it toed , is when we have a virtual proartie / field that is not stored in the db but canculated in other values , to show up when ever there is a output
    toJSON: { virtuals: true }, //each time that the data is outputed as json we want viruals true, the virtuals be part of the output
    toObject: { virtuals: true }, // same but for objects to
  }
);

//we need to make sure that we oreventing users to multiply reviews on the same tour - preventing duplicate reviews , for that we need to create an index query with the option if unique way
//each cmbination of tour and user allways must be unique
reviewSchema.index({ tour: 1, user: 1 }, { unique: true }); //may work several days after

//all find methods that have find method
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user', //we removed the tour option becouse of duplicate data!
    select: 'name photo',
  });
  next();
});

//taking the tour id and from there we find the current review is belongs to
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  //stats == promise , this is whay we need to wait to the proccess
  const stats = await this.aggregate([
    //first step to selcet all the reviews that is bellong the current tour - argument!
    { $match: { tour: tourId } },
    //canculate the statistics itself!
    {
      $group: {
        _id: '$tour', //we groping all tours by tour
        nRatings: { $sum: 1 }, //each tour that have been matched in the previous step
        avgRating: { $avg: '$rating' }, //we want to canculate the avarage from the rating
      },
    },
  ]);
  // console.log(stats);
  // on this proccess we created the function that cancuklating the avarge reviews ,
  //to procecss it and save it to the db with the new average wedoing this :

  //to deny an arr of null when there no reviews match at the top we need to create a simple check !
  if (stats.length > 0) {
    //the tour id that ws passes into the function , { the object of the data we want to update}
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRatings, //we getting the data from the array with the solution below!
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      //if there is no decuments that match the tour id , (no reviews at all ) then we setiing it back to the defult original numbers that we have written in the model!
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

//here we want to create an middleware funtion that will check every time that there is a new review is created
//we using post becouse pre is not saved in the collection , just a better price and what we need to canculate this prioceess
reviewSchema.post('save', function () {
  //this points to current review
  // Review.calcAverageRatings(this.tour)-> anfortunately this will not work becouse the model review is called after this pre shcema, this means that this middleware function will not work becouse the Review model will be undifend , we can also move the function under the Review verible becouse the schma will be also unreded becouse there we are passing it to the Review verible
  //to get around this problem we can basically write this.constactur , this will get to the model constarctor meaning getting to the schema function that we defind below
  this.constructor.calcAverageRatings(this.tour); //contains the tour id
});

//no we want the option to delete and update documents that will be also currect and updated in the db like in the example below:
// for that we have the mongoose options to implement that , and this options is only effective on hooks

//the two options:  findByIdAndUpdate , findByIdAndDelete

//this hook will work on two of our options becouse they both are working on this hook
reviewSchema.pre(/^findOneAnd/, async function (next) {
  //the goal is to get access to the current review document , the this-keyword is to the only query , how we are going to get pass that ?
  //we can basicaly execude a query and then that will give us the document that currently is beaing proccesd
  //to execude that we can use findone metohod , and save it somewhare | r --> meaning a review xd
  this.r = await this.findOne(); //TODO: this trick is ment to get acces to the current document by implementing the query , what will give us the curent documnet
  // console.log(r); --> here we can see that we getting the current document , before (becouse of the pre schema function ) the doocument was updated , giving us the oldeer data! ,to prevent that we must use the post middleware on the schema ,becouse we want to get to the data after he was updated. this might be confusing but to summary all of this , we need to get the query from the pre middleware and after that we need to implement the calcAveragaeStatistic function in the post middleware ! , cunclosion we need to pass the elemnt from the pre middleware to the post middleware
  console.log(this.r); //the current full document
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  // at this point the constractur is inside the this.r propartie  | this is what we was talking avout becouse this the way to pass the elemnt from pre middleware to the post middleware
  await this.r.constructor.calcAverageRatings(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);

//TODO:
//static method on our schema -> feature of mongoose that we can use them after that when we using the model , for example: Review.calcStats()
//instance method -> we can call on documents , its when we are runinug function meanwhile the schema  readed , definding when to use them in the process ( find , save , pre etc....)
module.exports = Review;

//TASKS:
// * implement both end point :
// -end point for geting our reviews -done!
//-end point for review creating new reviews --done!
//controller file - controller function - routes in our review routes file -create new reviews and recive them from the db with get all reviews end point --done!

//populate the two fields -  hint -> to populate we need to populate one for each fields // i implement it in one function
