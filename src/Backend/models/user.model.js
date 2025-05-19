const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - email
 *         - phoneNumber
 *         - address
 *         - password
 *       properties:
 *         firstName:
 *           type: string
 *           description: User's first name
 *         lastName:
 *           type: string
 *           description: User's last name
 *         email:
 *           type: string
 *           description: User's email address
 *         phoneNumber:
 *           type: string
 *           description: User's phone number
 *         address:
 *           type: string
 *           description: User's full address ending with a valid district (e.g., Imadol, Lalitpur)
 *         password:
 *           type: string
 *           description: User's password
 */

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
      validate: {
        validator: function (value) {
          // Regex to match the format: [specific place], [district]
          return /^[a-zA-Z\s]+,\s*(Kathmandu|Lalitpur|Bhaktapur)$/i.test(value);
        },
        message: 'Address must be in the format: [specific place], [district] (e.g., Imadol, Lalitpur)',
      },
    },
    password: {
      type: String,
      required: true,
    },
    verificationCode: {
      type: Number, // Store verification code temporarily
    },
    isVerified: {
      type: Boolean,
      default: false, // Initially false
    },
    role: {
      type: String,
      enum: ['user', 'staff', 'admin'],
      default: 'user',
    },
  },
  { collection: 'Users' }
);

module.exports = mongoose.model('User', userSchema);