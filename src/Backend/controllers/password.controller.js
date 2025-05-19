const bcrypt = require('bcrypt');
const User = require('../models/user.model');

// Change user password after validating old password
exports.changePassword = async (req, res) => {
  try {
    const { userId, oldPassword, newPassword, confirmPassword } = req.body;

    if (!userId || !oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long.' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'New passwords do not match.' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Old password is incorrect.' });
    }

    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({ message: 'Password changed successfully.' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Server error' });
  }
};