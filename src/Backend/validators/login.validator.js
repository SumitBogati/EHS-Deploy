const { checkSchema, validationResult } = require('express-validator');

const loginSchema = checkSchema({
  email: {
    notEmpty: { errorMessage: 'Email or phone number is required' },
  },
  password: {
    notEmpty: { errorMessage: 'Password is required' },
  },
});

exports.loginUserValidator = [
  loginSchema,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array().map((err) => ({
          field: err.param,
          message: err.msg,
        })),
      });
    }
    next();
  },
];