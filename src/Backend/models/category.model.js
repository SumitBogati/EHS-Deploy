const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    image: {
      type: String,
      required: true,
    },
  },
  { collection: 'Categories' }
);

module.exports = mongoose.model('Category', categorySchema);