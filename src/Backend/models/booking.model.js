const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookingSchema = new Schema(
  {
    service: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    staff: {
      type: Schema.Types.ObjectId,
      ref: 'Staff',
      required: true,
    },
    staffCategory: {
      type: String,
      required: true,
    },
    staffName: {
      type: String,
      required: true, 
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    serviceName: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    price: { 
      type: Number, 
      required: true 
    },
    date: {
      type: String,
      required: true,
    },
    timeSlot: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'inprogress', 'cancelled', 'completed'],
      default: 'pending',
    },
    paymentId: {
      type: Schema.Types.ObjectId,
      ref: 'Payment',
    },
    paymentStatus: {
      type: String,
      enum: ['initiated', 'completed', 'failed'],
      default: 'initiated',
    }
  },
  { collection: 'Bookings', timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);