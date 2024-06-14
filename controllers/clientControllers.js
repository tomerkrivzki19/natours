const multer = require('multer'); // multer => is a middleware form npm package that is handling multi-part form data , upload filles from a form basiccly
const sharp = require('sharp');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('../controllers/handlerFactory');

// Multer Storage
//saving inside the apllication storage:
// when we used the multer middle ware to upload file we saw that when the fille is uploaded and saved inside the /img/users folder , we saw that the fille name was long and not understandtable , there was not ending to the fille ( meaning it will not adenify as an img (no img,png etc..)) so to controll our filles that coming from the client we need todo this steps:
// we need to create one multer storage and one multer filter, and after we defind thier options of creating a fille we going to use them and create a upload from there

// const multerStorage = multer.diskStorage({
//   //                     cb =>callback function
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     //          userID , Time stemp
//     //user-78769784641551-65656566264.jpeg
//     //exteract the time stemp from the file (we can see the options on req.file) => the (jpeg,png etc...)
//     const ext = file.mimetype.split('/')[1];
//     //caling the calback with no error and the file name
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

//saving inside the memory storage:
const multerStorage = multer.memoryStorage(); //saves as a buffer =   חוצץ הוא מקטע זיכרון המאחסן מידע באפן זמני בעת העברתו ממקום למקום

// multer filter:
const multerFilter = (req, file, cb) => {
  // test if the upload fille is an image , and if so pass true to the callback function and if its not we will pass a false to a callback function with an error
  // we do not want to upload fille that its not images , so this is why the function stands for | if in out application we want to upload somthing les , we can make here an function taht will test those sort of filles
  //mimetype => not matter what image file will be uploaded ,inside the  mimetype will allways start with iamge/
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images', 400), false);
  }
};

// if we dont specify and options , its basiclly will stored inside the memory and not saved any where in the disk
//  we can add  dest(destination) =>  the folder we want to save all the images, ( on this example we used a separate function for that ....)
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single('photo'); //upload.single('photo') => we created a multer package with the name of upload , and the upload is just desing to setup serveral settings where on this exmaple we only find the destination , then we use that upload to create a new middleware that we can add to the stack of the route that we want to use to upload the fille --> for that we use upload.single() , becouse we only have a single fille and in there we specify the name of the fiels its going to hold this fille -  after it hadlaed it will put it on the req as an object (req.file )

//creating a middleware that is manipulate our images that the user upload, what the middleware will do is to convert the image (if the image is a max size ot bigger then what we need ) and convert it to the currect size
exports.resizeUserPhoto = async (req, res, next) => {
  try {
    //we have the file in our req , so if there no upload was done we dont want to do anything
    if (!req.file) return next();

    //this file.filename is not yet definded becouse when we using a memory storage as a buffer the fille name was not realy get set , but we rellay on it on the other middleware function (in updateMe ) where we rellay the req.file.filename to contain an image of the user ( uploaded one ) to update the image in the database
    // previslly it was defind by our multer upload settup , but when we cahnge that we now set it on this here
    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

    // sharp - package / image procceing libary for node js , resize imaegs in a very simple way
    // we saving the file inside sharp , and for that we need to make sure that the images that the user upload is saving inside the memory and not in the program first , bexouse we need to manipulate them first !
    // we basiclly keep the image in memory and here we basically read that  (req.file.buffer) --> that way we dont need to call the image from the folder again and then work on it = best pratic in this way and aslo saving us some code xd

    await sharp(req.file.buffer) // => create an object then we can add some manipulation to that with sharp
      .resize(500, 500) // Wpx |  Hpx |
      .toFormat('jpeg') // covert to ''
      .jpeg({ quality: 90 }) //  for saving memory
      .toFile(`public/img/users/${req.file.filename}`); // need the entire path to the file

    next();
  } catch (error) {
    next(error);
  }
};

//                       rest paramters for the allowed fields -. will create an array with all the elemnts we passed in
const filterObj = (obj, ...allowedFields) => {
  //need to loop and check if it contanis from the allowed fields and if it sinple add it to a new object that we will return in the end

  const newObj = {};
  //one of the easy ways to loop threw an object in js
  Object.keys(obj).forEach((el) => {
    //if the allowedFields arrays incloudes the current element(field name) we want to add the to a newObj with the current field should be equal to whatever in the ibejct with the current field name
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

//A middleware function to overwrite the fet user from the params method , but instead just ytake the user id from the req when she simply loged-in
exports.getMe = (req, res, next) => {
  //we want to get the current id that coming from the log in user -- to implement that we are creating a simple middlewareS
  // this way we do not need to this end point the user id from the end poind(PARAMS ):
  req.params.id = req.user.id;
  next();
};

// exports.getAllClients = async (req, res) => {
//   try {
//     const Users = await User.find();

//     res.status(200).json({
//       status: 'success',
//       results: Users.length,
//       data: {
//         Users,
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// };

exports.getAllClients = factory.getAll(User);

//updating the user data
exports.updateMe = async (req, res, next) => {
  try {
    //1) Create an err if the user POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
      return next(
        new AppError(
          'This route is not for password updates. Please use /updateMyPassword',
          400
        )
      );
    }
    // Update the user document -> if not POSTs password data !
    // const user = await User.findById(req.user.id);
    // user.name = 'Jonas';
    // await user.save();
    //this proccess will not work ! becouse passeordConfirm is a required field but we did not specify it inside of the req
    //this is why the save() proccess is not accurade in this function

    //what we can do now is findByIdAndUpdate -> we cannot use that anywhere when we are messing around with passwords ,
    //but in this exmaple we dont tutch password at all , and this is why using here the findByIdAndUpdate method will work perectly , ( here we are using not-sensative data like mail or email  )
    //                                                 findById ,the data , options | the data we want to update with

    //why we put out x inwted of req.body -> that becouse we dont want to update everything that in the body, for example if the user type indie the body the role , this will allow to any user change to the administrator , and that should be not allowed ! and  more exmples like restart token etc...
    // we need to make sure that the body contains only name and email ptoparties , becouse for now they are the only things we want to allow to update --> for that we want to filter the body to contain only fields of email and name !
    //for example if the user wont to change the role it will be filtert that way that the output will display only proparties of email and name and that way , the data like role and other stuff in the body will not saved into the database

    //2)Filtered out unwanted names that are not allowed to be updated
    //the value that the client type inside the body |the proparties we want to filter of

    const filteredBody = filterObj(req.body, 'name', 'email'); //we will add some more stuff later like image and more..
    //adding the image to the actuall user
    //all we doing here is to add the photo propartie to the object (filteredBody) , that is going to be updated in the model , and that photo propartie is equal to the file name

    if (req.file) filteredBody.photo = req.file.filename;

    //3) Update user document
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      filteredBody,
      {
        new: true, //will return us the new object menas the updated object  instead of the old one
        runValidators: true, //we want mongoose to validate out data becouse if we put in invalid email adress that should be catch by the validaor  and return an err
      }
    );

    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.createClient = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined! Please use /singup instead',
  });
};

exports.deleteMe = async (req, res, next) => {
  //                                    the data we want to update
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    message: null,
  });
};

// exports.getClient = (req, res) => {
//   res.status(500).json({
//     status: 'faild',
//     message: 'something went wrong',
//   });
// };
exports.getClient = factory.getOne(User);

//Do NOT update password with this!
exports.updateClient = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
