const { checkSchema, validationResult } = require('express-validator');
const User = require('../models/user.model');
const Staff = require('../models/staff.model');

// Define validation schema
const userSchema = checkSchema({
  firstName: {
    trim: true,
    notEmpty: {
      errorMessage: 'First name is required',
    },
  },
  lastName: {
    trim: true,
    notEmpty: {
      errorMessage: 'Last name is required',
    },
  },
  email: {
    trim: true,
    notEmpty: { errorMessage: 'Email is required' },
    isEmail: { errorMessage: 'Invalid email address' },
    custom: {
      options: (value) => value === value.toLowerCase(),
      errorMessage: 'Email must be in lowercase',
    },
  },
  phoneNumber: {
    trim: true,
    notEmpty: { errorMessage: 'Phone number is required' },
    matches: {
      options: [/^(97|98)\d{8}$/],
      errorMessage: 'Phone number must start with 97 or 98 and be 10 digits long',
    },
  },
  address: {
    trim: true,
    notEmpty: { errorMessage: 'Address is required' },
    custom: {
      options: (value) =>
        /^[a-zA-Z\s]+,\s*(Kathmandu|Lalitpur|Bhaktapur)$/i.test(value),
      errorMessage:
        'Address must be in the format: [specific place], [district] (e.g., Imadol, Lalitpur)',
    },
  },
  password: {
    notEmpty: { errorMessage: 'Password is required' },
    isLength: {
      options: { min: 8 },
      errorMessage: 'Password must be at least 8 characters long',
    },
    matches: {
      options: /^(?=.*[0-9])(?=.*[!@#$%^&*])/,
      errorMessage:
        'Password must contain at least one number and one special character',
    },
  },
  confirmPassword: {
    notEmpty: { errorMessage: 'Confirm password is required' },
    custom: {
      options: (value, { req }) => value === req.body.password,
      errorMessage: 'Confirm password must match the password',
    },
  },
});

// Validation middleware
exports.createUserValidator = [
  userSchema,
  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array().map((err) => ({
          field: err.param,
          message: err.msg,
        })),
      });
    }

    const { email, phoneNumber } = req.body;

    const [existingUser, existingStaff] = await Promise.all([
      User.findOne({ $or: [{ email }, { phoneNumber }] }),
      Staff.findOne({ $or: [{ email }, { phone: phoneNumber }] }),
    ]);

    if (existingUser || existingStaff) {
      const errorMessages = [];
      if (existingUser?.email === email || existingStaff?.email === email) {
        errorMessages.push({ field: 'email', message: 'Email is already in use' });
      }
      if (
        existingUser?.phoneNumber === phoneNumber ||
        existingStaff?.phone === phoneNumber
      ) {
        errorMessages.push({ field: 'phoneNumber', message: 'Phone number is already in use' });
      }
      return res.status(400).json({ errors: errorMessages });
    }

    next();
  },
];