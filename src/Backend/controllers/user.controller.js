const User = require('../models/user.model');
const Booking = require('../models/booking.model');
const Payment = require('../models/payment.model');


// Get All Users (Only Users with role "user")
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: 'user' });
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get a Single User by ID
exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Update User (Only Updates Provided Fields)
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Check if the user exists
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if the phone number is already taken
        if (updates.phoneNumber) {
            const existingUser = await User.findOne({ phoneNumber: updates.phoneNumber });
            if (existingUser && existingUser._id.toString() !== id) {
                return res.status(400).json({ error: 'Phone number already in use' });
            }
        }

        // Update only the provided fields
        Object.keys(updates).forEach((key) => {
            user[key] = updates[key];
        });

        await user.save(); // Save updated user

        res.status(200).json({ message: 'User updated successfully', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Delete User
exports.deleteUser = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Find and delete the user
      const user = await User.findByIdAndDelete(id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      // Delete related bookings
      await Booking.deleteMany({ user: id });
  
      // Update related payments: set userName to 'Deleted User'
      await Payment.updateMany(
        { user: id },
        { $set: { userName: 'Deleted User' } }
      );
  
      res.status(200).json({ message: 'User deleted. Bookings removed. Payments marked as deleted.' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ error: 'Server error' });
    }
  };