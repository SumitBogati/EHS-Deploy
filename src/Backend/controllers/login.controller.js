const User = require('../models/user.model');
const Staff = require('../models/staff.model');
const { generateToken } = require('../jwt');
const bcrypt = require('bcrypt');

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    let account = null;
    let role = null;

    // Check if the input looks like an email (contains @)
    if (email.includes('@')) {
      account = await User.findOne({ email });
      if (account) {
        role = account.role;
      }
    } else {
      // Assume it's a phone number and validate format
      const phoneRegex = /^(97|98)\d{8}$/;
      if (!phoneRegex.test(email)) {
        return res.status(400).json({
          error: 'Invalid phone number. It must start with 97 or 98 and be 10 digits long.',
        });
      }
      account = await Staff.findOne({ phone: email });
      if (account) {
        role = 'staff';
      }
    }

    if (!account) {
      return res.status(404).json({ error: 'Account does not exist' });
    }

    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    // Generate token with all details
    const token = generateToken({
      id: account._id,
      firstName: account.firstName,
      lastName: account.lastName,
      phoneNumber: account.phoneNumber,
      address: account.address,
      email: account.email,
      role: role,
    });

    // Send full user object in response
    res.status(200).json({
      message: 'Login successful',
      user: {
        id: account._id,
        firstName: account.firstName,
        lastName: account.lastName,
        phoneNumber: account.phoneNumber,
        address: account.address,
        email: account.email,
        role: role,
      },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};