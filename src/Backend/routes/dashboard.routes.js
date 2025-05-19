const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboard.controller');

/**
 * @swagger
 * /api/dashboard/total:
 *   get:
 *     tags:
 *       - Dashboard
 *     summary: Get total number of users, staff, bookings, and total payment amount
 *     description: Retrieves the total count of users, staff, bookings, and the total amount of completed payments.
 *     responses:
 *       '200':
 *         description: Successfully retrieved total numbers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalUsers:
 *                   type: integer
 *                   description: Total number of users
 *                 totalStaff:
 *                   type: integer
 *                   description: Total number of staff
 *                 totalBookings:
 *                   type: integer
 *                   description: Total number of bookings
 *                 totalPaymentAmount:
 *                   type: number
 *                   description: Total amount of completed payments
 *       '500':
 *         description: Server error
 */
router.get('/dashboard/total', getDashboardStats);

module.exports = router;