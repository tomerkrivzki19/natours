const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel');

const tourSchema = new mongoose.Schema(
  {
    // name: String,
    // we can make it more optional like defing snother stuuf not only the type of the value
    name: {
      type: String, // THIS IS THE DESCRIBTION FOR THE ERR ALERT THAT WILL JUMP -- THAT WAY WE WILL KNEW WHAT WENT WRONG
      required: [true, 'A tour most have a name '],
      // we cannot  have two tour elemnts with the same name ---   its mant to say that name is most to be uniqe
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal then 40 characters'],
      minlenght: [10, 'A tour name must have more or qual then 10 characters'],
      // validator: [validator.isAlpha, 'Tour name must only contain characters'], //validator is an object that inside him we have all this tyoe of methods
    }, //specify a function that we use (validator),
    slug: String, //for the middleware of moongose we must to save the slug propartie in the mongoose
    duration: {
      type: Number,
      required: [true, 'A tour most have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour most have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour most have a difficulty'],
      enum: {
        //enum esure that the values that we set must be apllied from the client
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either :easy, medium, difficult ',
      },
    },
    ratingsAverage: {
      type: Number,
      // this is a defult value , if we not specify the value of rating the default will be 4.5
      default: 4.5,
      unique: false,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: (val) => Math.round(val * 10) / 10, //set function -> this function will run each time when a value is set to this field () ||TODO:  (val *10 )/ 10 ine the callback funciton -> 4.66666 => (val *10) / 10 = 4.7
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
      unique: false,
    },
    price: {
      type: Number,
      required: [true, 'A tour most have a price '],
    },
    priceDiscount: {
      type: Number, //for creating our own validators
      validate: {
        validator: function (val) {
          return val < this.price; // 100 < 200  -> true no err || 250 < 200 -> false trigaer a validation err
        }, //this keyword will only point on the current document when we will creat new document - not going to work on update req
        message: 'Discount price ({VALUE}) should be below the regular price',
      }, //      ({VALUE}) -> this peice here will get access to the value that was inputed
    },
    summary: {
      type: String,
      //  trim --> will remove all the white space in the begining and the end of the string
      trim: true,
      required: [true, 'A tour most have a description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String, // the image url || name will be displayed in the db
      required: [true, 'A tour most have a cover image'],
    },
    images: [String],
    createdAt: {
      //the time that the user created a tour
      type: Date, //js build in data type
      default: Date.now(), //give us a time stand in miliseconed -- then in mongo it will converted to a now date
      select: false, //propaty to hide from the putpot
    },
    startDates: [Date],
    secretTour: {
      typeof: Boolean,
      default: false,
    },
    startLocation: {
      //TODO: a document that points surten dot on earth
      //GeoJson(speeld geo-json) --> in order to specify Go - special data, how it work? the object have no option but instead we can set to this object soome types of proparties, to set this object as ge-oJson object we need to delare two proparties : the type and the coordinates
      type: {
        //schema type -> on this positoin the diffretns are that here is now sub-fields
        type: String,
        default: 'Point', // pligans|lines
        enum: ['Point'], // IT CAN BE ONLY POINT
      },
      coordinates: [Number], // here we accepts an array of numbers
      address: String,
      description: String,
    },
    locations: [
      //embbeded documnet is a object that we pass to another object in a way o building data , so on this example we are embbeding this object , and in order to embbed that object he must be in a array
      //          להטביע
      //TODO: to embbede all the locations into the tour document, to make that happen we need to create an array
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number, //the day of the tour whitch people will go to this location
      },
    ],
    // EXAMPLE FOR USERSCHEMA.PRE SAVE --EXAMPLE OF BEDDING
    // guides: Array, // we impleteing here an adoons of the guides that will be in that tour, when creating a new tour it simply will add inside an array the guides that connected to that tour
    guides: [
      {
        type: mongoose.Schema.ObjectId /*an mongoose id defenation type */,
        ref: 'User', //esablish refernce between difrrent refernces in monngoose // the User schema , we dont need to reequire the schema this one like this will work perfectly
      },
    ],
  },
  {
    //we can defind to a schma an object to basicly defing option to this schema
    toJSON: { virtuals: true }, //each time that the data is outputed as json we want viruals true, the virtuals be part of the output
    toObject: { virtuals: true }, // same but for objects to
  }
);

//TODO: INDEX-ES
//1 -> sorting the price index in asending order | -1 -> sorting the price index in desending order
//tourSchema.index({ price: 1 }); //after this operation we can see in the executionStats options , the totalDocsExamined  was 3 . instead of 9 (written all the documents ), this stuff ( indexes )is good for better prtformence . making the mongoose engine mutch faster!
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' }); //diffrent index we need -- 2dsphere earh fere?  -- this index if ment to the getTourWithin radius function
//how to we decide which fields should contain index and why we dont set indexes on all the fields?
// answer:
//* we need to carfully studie the access paderen of our application in order to figure out whitch fiels are query the most then set the indexes for this fiedlds, exampe i dont make a fields to a group size- becouse i dont belive that many people should query that pormater
// * we do not want to overdo it with indexes , so we dont want to blindy set indexes on all the fields and hope for the best , the reason for that is that wach index is actually uses resureces , and also each index should be updated | need to be update each time the underline of the collection is updated,
// in summary when desciding when to index field or not we need to balance the current field with the cost of mentaining the index and also with the reead write parten with that resource,

//virtual proparties --> proparties that we dont want to save inside the db , for example if we want to convert miles to kilometers there is no need of storing this type of proprtie in the db
//basicly if we using a virtual proparties we then could not use them inside qury, becouse this proparty does not inside the db
//what we could do is to do this conversion when we after we query the data like in the controller and this is not going to be a good practic becouse we want to try keep businnes logic and applicaion logic  as mutch speretaed as possible
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7; //canculate the duration in weeks --> duration in days devided by 7 becouse we have seven days in a week
  //*we made a regular basic function and not a arrow function becouse we need the this keyword , and in arrow function we dont have access to a this keyword
  //! ususally if we need to use this keyword we will then use a regular function
});

//TODO: virtualPopulate- its basiclly a bypass to refernce a child id document inside the schema model without adding it on the actual schema , but to just bypass it threw the populate method
//   virtual --> will not save in the db or update the db , simpaly display the data on output -depending on the
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour', //the name of the field in the other model wehere is the refernce to the other model is stored --> inside the reviewModel the tour propartie is where the id is stored , this is waht we need to implement to that foreignField
  localField: '_id', // where the id stored in that current tour model ->  in the current model its called _id (in the db)
});

//like in express middleware we can use also the mongoose middle-wares
//in mongoose there are 4 types of middleware :
//1.documement middleware -
//2.query middleware
//3.aggreation middleware
//4.model middleware

//in the mongoose middlewares we can basicly defind what going to happend when we saving the document in db and what will happen after and basicly things like this

//DOCUMENT MIDDLEWRE -- run before the save() command and .crete() command
//this pre mongoose function will give us the option to defind what going to be before the saving of a document
tourSchema.pre('save', function (next) {
  // console.log(this); //in this function we have access to the document that beeing proccess

  //  slug -->  just a string that we can put on the url , the is build in a simple string like the name
  //creating a slug for each of the document
  this.slug = slugify(this.name, { lower: true }); //lower-> make the lower to a big letters
  next();
});

// // TODO:Embedding tour guides EXAMPLE :
// //only work for creating an tour
// tourSchema.pre('save', async function (next) {
//   //aray of all guides - > we lopint threw map and then output the user documnt for the current id
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   //overwrite the guides array to the guidesPromises document
//   this.guides = await Promise.all(guidesPromises);
//   //Promise.all()- becouse guidesPromises is an array full of promises , and then we need to wait to each Promise to resolve

//   next();
// });
//pre- save hook
// tourSchema.pre('save', function (next) {
//   console.log('Will save document ....');
//   next();
// });

// //  post -       hook
// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

//** we can add middleware before and after a serting event and in a event of document there will be a save event

//QUERY MIDDLEWARE --allow us run function berfore and after query documnets
//we can use this middle ware in this example ;
//if we have a vip tours and we want to hide it from the "public" -the other useers we can create a secret tour field and then query for all tours that are not secret
//the solution for the all find jooks - meaning that this /^find/ hook will work on all of the find methods
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } }); //not equal to true
  //clock how many time the req was executed :
  this.start = Date.now(); //the current time in miliseconed
  next();
});

//This pre Schema fucntion is for pupllicate function in monngose that have the option of quering data with mongoose
tourSchema.pre(/^find/, function (next) {
  //the current query
  this.populate({
    // "                                         "..populate(guides) --> this will do the work just fine , but if we want to query propaties  in the output we can use the options and set the selcet options . and from there to sekct akll the proparties we dont want them to show in the output
    // Options for the populate

    path: 'guides',
    select: '-__v -passwordChangedAt -passwordResetExpires -passwordRestToken', //secting the fields that we dont want them to display in the output , by adding also to the name of fields we do not want to uotput the minus sign
  });

  next();
});

//this method is working only for find , not findOne
//this is the soultion : the first sulotion is to vopy and change to findOne-not the best practic | the seconde solution for this is ansered up in the hook section

//will activate after the query alredy exuecuted - testing for post midleware
// tourSchema.post(/^find/, function (docs, next) {
//   console.log(`Query took ${Date.now() - this.start} miliseconeds!`);
//   // console.log(docs);
//   next();
// });

//צבירה
//AGGERATION MIDDLEWARE -- aloow us to add hooks before and after the aggreation happens
// tourSchema.pre('aggregate', function (next) {
//   // unshift() -> add a elemnt in a biggining of an array
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } }); //removing from the output all the elements that have secret tour set to true
//   console.log(this.pipeline());
//   next();
// });

//data validation - cheking if the enterd values are in the right format for each field ot a document scehma and also that the vlaues hade actually been entered for all of the required fields
//we also have senitation -- it so insure that the inputed data is basiclly clean - remove unwonted data and remove them secure data!
//required -> build in data validator
// maxlenght -> build in data validator
//                           most have a capital name at first -RULE !!
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
