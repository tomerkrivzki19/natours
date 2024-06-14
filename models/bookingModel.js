const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  //keeping a reference to a tour and also to the user who booked a tour
  tour: {
    type: mongoose.Schema.ObjectId, //cuurection to an err of andifiend value
    ref: 'Tour',
    required: [true, 'Booking must belong to a Tour'],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Booking must belong to a User'],
  },
  price: {
    type: Number,
    required: [true, 'Booking must have a price'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  //if administartor want to create a booking outside of stripe , ffor exmaple if a costumer dosen't have a crdit-card and wants to pay directly at the store with cash and for that the administrator might then use the booking API in order to basiclly manually create a tour and so that must be paid or not yet paid
  paid: {
    type: Boolean,
    default: true,
  },
});

//query middleware
bookingSchema.pre(/^find/, function (next) {
  //for guide to check who booked their tours
  this.populate('user').populate({
    //only want to populate the tour name
    path: 'tour',
    select: 'name',
  });
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
