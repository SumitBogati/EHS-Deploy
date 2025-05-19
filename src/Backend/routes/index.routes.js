const express = require('express');
const signupRoutes = require('./signup.routes');
const loginRoutes = require('./login.routes');
const categoryRoutes = require('./category.routes')
const serviceRoutes = require('./service.routes')
const bookingRoutes = require('./booking.routes');
const forgotPasswordRoutes = require('./forgotPassword.routes');
const paymentRoutes = require('./payment.routes')
const staffRoutes = require('./staff.routes')
const userRoutes = require('./user.routes')
const dashboardRoutes = require('./dashboard.routes')
const passwordRoutes  = require('./password.route')


const router = express.Router();

// Use user-related routes
router.use(signupRoutes);
router.use(loginRoutes);
router.use(categoryRoutes);
router.use(serviceRoutes);
router.use(bookingRoutes);
router.use(forgotPasswordRoutes);
router.use(paymentRoutes)
router.use(staffRoutes)
router.use(userRoutes)
router.use(dashboardRoutes)
router.use(passwordRoutes)

router.get('/test', (req, res) => {
  res.json({ message: 'API is working' });
});

module.exports = router;