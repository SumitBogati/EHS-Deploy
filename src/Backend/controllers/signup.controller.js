const bcrypt = require('bcrypt');
const User = require('../models/user.model');
const { sendVerificationCode, sendWelcomeEmail } = require('../emailService');
const { generateToken } = require('../jwt');

const usersTempStore = new Map();

// Create user and send verification code
exports.createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, phoneNumber, address, password, confirmPassword } = req.body;

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create a temporary user object
    const newUser = { 
      firstName, 
      lastName, 
      email, 
      phoneNumber, 
      address, 
      password: hashedPassword
    };

    // Generate a 4-digit verification code
    const verificationCode = Math.floor(1000 + Math.random() * 9000); // Generates a random 4-digit number
    console.log(`Verification code for ${email}: ${verificationCode}`);

    // Store the temporary user object and verification code in the map
    usersTempStore.set(email, { user: newUser, verificationCode });

    // Send the verification code via email
    await sendVerificationCode(email, verificationCode, firstName);

    res.status(201).json({ message: 'Please check your email for the verification code.' });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Verify code and save user to DB after successful verification
exports.verifyCode = async (req, res) => {
  const { email, code } = req.body;

  // Check if user exists in the temporary store
  const storedData = usersTempStore.get(email);

  if (!storedData) {
    return res.status(400).json({ error: 'User not found in temporary store' });
  }

  // Check if the code matches the stored verification code
  if (storedData.verificationCode === parseInt(code)) {
    // Code is correct, create and save user to the database
    const newUser = new User({
      ...storedData.user, 
      isVerified: true // Set isVerified to true after successful verification
    });

    // Save the user to the database
    await newUser.save();

    // Generate JWT token after successful user creation and verification
    const token = generateToken({
      id: newUser._id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      phoneNumber: newUser.phoneNumber,
      address: newUser.address,
      email: newUser.email,
      role: newUser.role,
    });

    // Send the welcome email
    await sendWelcomeEmail(newUser.email, newUser.firstName);

    // Clear the temporary data after successful verification
    usersTempStore.delete(email);

    res.status(200).json({
      message: 'Email verified successfully! User created.',
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        phoneNumber: newUser.phoneNumber,
        address: newUser.address,
        email: newUser.email,
        role: newUser.role,
      },
      token,
    });
  } else {
    res.status(400).json({ error: 'Invalid verification code' });
  }
};