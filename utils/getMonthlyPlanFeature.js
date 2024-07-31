const Tour = require('../models/tourModel');

module.exports = async (year) => {
  try {
    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates',
      },
      {
        $match: {
          'startDates.date': {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
            // $gte: new Date(`${year}-01-01T00:00:00.000Z`),
            // $lte: new Date(`${year}-12-31T23:59:59.999Z`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates.date' },
          numTourStarts: { $sum: 1 },
          tours: { $push: '$name' },
        },
      },
      {
        $addFields: { month: '$_id' },
      },
      {
        $project: {
          _id: 0,
        },
      },
      {
        $sort: { numTourStarts: -1 },
      },
      {
        $limit: 12,
      },
    ]);

    return { plans: plan };
  } catch (error) {
    return { status: 'failed', message: error.message };
  }
};
