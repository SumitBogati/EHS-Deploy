const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const paymentSchema = new Schema({
  service: {
    type: Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  staff: {
    type: Schema.Types.ObjectId,
    ref: 'Staff',
    required: true,
  },
  userName: {
    type: String,
    required: true
  },
  serviceName: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  timeSlot: {
    type: String,
    required: true
  },
  khaltiTransactionId: String,
  status: {
    type: String,
    enum: ['initiated', 'completed', 'partial', 'refunded', 'failed', 'cancelled'],
    default: 'initiated'
  },
  pidx: String, 
  paymentDetails: Object
}, 
{ 
  timestamps: true, 
  collection: 'Payment'
}
);

module.exports = mongoose.model('Payment', paymentSchema);