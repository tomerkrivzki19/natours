// here we building a scrip that will be independed from the rest of the code
//WE creating this to add a file that we have , read him with node.js and store it inside our DB collection
const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../models/tourModel');
const Review = require('../../models/reviewModel');
const User = require('../../models/userModel');

// const configFile = require('../../config.env');

dotenv.config({ path: '../../config.env' });

// After loading environment variables
// console.log('DATABASE:', process.env.DATABASE);

// Check if the DATABASE variable is defined
if (!process.env.DATABASE) {
  console.error('DATABASE environment variable is not set.');
  process.exit(1); // Exit the script with an error code
}

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
// const DB = process.env.DATABASE;
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then((con) => {
    // console.log(con.connections);
    console.log('DB connection succseful');
  })
  .catch((err) => {
    console.log('connnection to mongoDB failed', err);
  });

// Remove the unique index constraint on the rating field if null values are acceptable
// Tour.collection.dropIndex({ rating: 1 });

//   READ JSON FILE
// const path = require('path');
// const toursFilePath = path.join(__dirname, 'tours.json');
const tours = JSON.parse(fs.readFileSync('./tours.json', 'utf-8'));
const users = JSON.parse(fs.readFileSync('./users.json', 'utf-8'));
const reviews = JSON.parse(fs.readFileSync('./reviews.json', 'utf-8'));

//IMPORT DATA INTO DB
const importData = async () => {
  try {
    await Tour.create(tours); //Big note ! -> we need to turn off the incryptede password option in the midel becouse inside the json files (json files with api data ) , there is already incrypted data
    await User.create(users, { validateBeforeSave: false }); //validateBeforeSave: false  --> becouse of the mongoose password conform err code when deploing this option should overright this problem, this means the all the validation we do in the model will be slkipped
    await Review.create(reviews);
    console.log('data succesfuly loaded!');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

//DELETE ALL DATA FROM COLLECTION -> DB

const deleteData = async () => {
  try {
    await Tour.deleteMany(); //deleteMany => pass nothing and it will delete all document in the collection
    await Review.deleteMany();
    await User.deleteMany();
    console.log('data succesfuly deleted!');
  } catch (error) {
    console.log('Error deleting data:', error);
  }
  process.exit(); //kind of agrreive way to stopping apllication
};

// we can defind that when we are starting the single file , we can decide on whitch of the function it will started
//like we have --imported function || --delete function

// in this function it will work depending on the location for example:

// we have a three way point to the path that we are current using

//  'C:\\Program Files\\nodejs\\node.exe',
// 'C:\\Users\\krivi\\OneDrive\\Desktop\\complete-node-bootcamp\\4-natours\\starter\\dev-data\\data\\import-dev-data.js

//so we need to select the third path , that way we implementing that inside the function:

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
} else {
  console.log('Invalid command. Use --import or --delete.');
}

// then when we are calling to the file in the command we are basicliy add to it the --import | --delete sentnce to the end

console.log(process.argv);

//    STARTING THE FILE PROCEESS:
// we can start the file from the command line ,instead of startinf ot frm the server we can simaply start it ones and from the command line
// to start what we need to do , we need to follow this steps :

// *  first in the command line we need to locate the parent folder that the file is located
// !! -- we need to make sure that everything is on the right steps , like libary location.], imported stuff is on the right path etc..
// * secened we need to type inside the command line : node ____________ in this case - import-dev-data.js  --import
//                                                          file full name
