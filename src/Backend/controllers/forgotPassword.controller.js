const User = require('../models/user.model');
const { sendVerificationCode } = require('../emailService');
const bcrypt = require('bcrypt');

// Temporary variable to store email and verification code 
const passwordResetStore = new Map();

// Forgot password - Request a verification code
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Check if the email exists in the database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate a 4-digit verification code
    const verificationCode = Math.floor(1000 + Math.random() * 9000);
    console.log(`Password Verification code for ${email} : ${verificationCode}`);

    // Store the verification code temporarily
    passwordResetStore.set(email, verificationCode);

    // Send verification code to the user's email
    await sendVerificationCode(email, verificationCode, user.firstName);

    res.status(200).json({ message: 'Verification code sent to your email.' });
  } catch (error) {
    console.error('Error sending verification code:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Verify the code and allow the user to reset password
exports.verifyResetCode = async (req, res) => {
  const { email, code, newPassword, confirmNewPassword } = req.body;

  try {
    const storedCode = passwordResetStore.get(email);

    // Check if code is correct
    if (parseInt(code) !== storedCode) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    // Validate password presence
    if (!newPassword || !confirmNewPassword) {
      return res.status(400).json({ error: 'Password and confirm password are required' });
    }

    // Validate password match
    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    // Validate password length
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    // Validate password pattern
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({ error: 'Password must contain at least one number and one special character' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password in the database
    await User.updateOne({ email }, { password: hashedPassword });

    // Clear the temporary verification code
    passwordResetStore.delete(email);

    res.status(200).json({ message: 'Password reset successfully.' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ error: 'Server error' });
  }
};