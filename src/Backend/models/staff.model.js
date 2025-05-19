const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const staffSchema = new Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    image: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: 'staff',
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      match: /(?=.*[!@#$%^&*(),.?":{}|<>])/,
    },
  },
  { collection: 'Staff' }
);

module.exports = mongoose.model('Staff', staffSchema);