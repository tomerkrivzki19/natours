//the goal is to create a function that return a function , not only for the tour but to every function in our apllication that might have the update/ delete /create functionality
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

//this function will use to all documents like delete user ot delete a tour / user and feuterd documents....
exports.deleteOne = (Model) => async (req, res, next) => {
  try {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError('No documment found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    res.status(500).json({
      message: error,
    });
    // console.log(error);
    // next(error);
  }
};

exports.updateOne = (Model) => async (req, res, next) => {
  try {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true, //mybe mot working -not sure becouse mongoose dont eccept new changes in the schema
    });

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.createOne = (Model) => async (req, res, next) => {
  try {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        tour: doc,
      },
    });
  } catch (error) {
    next(error);
  }
};

//popOptions => this is for the populate options , let say we have a popualte object we want to pass in , then we can use this argument
exports.getOne = (Model, popOptions) => async (req, res, next) => {
  try {
    let query = Model.findById(req.params.id);
    //the solutiion for the populate option
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      return next(new AppError('No document found with that ID ', 404)); // we seting return becouse we want to return this function imidiatly and not move on to the next line , and willl run two responses
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getAll = (Model) => async (req, res, next) => {
  try {
    //To allow for nested GET reviews on tour (hack)
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    // const doc = await features.query.explain(); //.explain() --? to indexes options and data
    const doc = await features.query;
    res.status(200).json({
      status: 'success',
      // reqestedAt: req.requestTime,
      results: doc.length,
      data: {
        data: doc,
      },
    });
  } catch (error) {
    next(error);
  }
};
