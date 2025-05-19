const User = require('../models/user.model');
const Staff = require('../models/staff.model');
const Booking = require('../models/booking.model');
const Payment = require('../models/payment.model');

// Get total number of users, staff, bookings, and total payment amount
exports.getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'user' });
        const totalStaff = await Staff.countDocuments();
        const totalBookings = await Booking.countDocuments();

        // Get total sum of completed payments
        const totalPayment = await Payment.aggregate([
            { $match: { status: 'completed' } }, // Only count completed payments
            { $group: { _id: null, totalAmount: { $sum: "$amount" } } }
        ]);

        // Get the latest 5 transactions
        const latestTransactions = await Payment.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user', 'firstName lastName')
            .populate('service', 'name');

        res.status(200).json({
            totalUsers,
            totalStaff,
            totalBookings,
            totalPaymentAmount: totalPayment.length > 0 ? totalPayment[0].totalAmount : 0,
            latestTransactions
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};