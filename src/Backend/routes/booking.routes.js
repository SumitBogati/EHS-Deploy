const express = require('express');
const { addBooking, getBookings, getUserBookings, getStaffBookings, rescheduleBooking ,updateBookingStatus, deleteBooking } = require('../controllers/booking.controller');

const router = express.Router();

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     tags:
 *       - Bookings
 *     summary: Add a new booking
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               serviceId:
 *                 type: string
 *                 description: ID of the service being booked
 *               userId:
 *                 type: string
 *                 description: ID of the user making the booking
 *               staffId:
 *                 type: string
 *                 description: (Optional) ID of the assigned staff member
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Date of the booking (YYYY-MM-DD)
 *               timeSlot:
 *                 type: string
 *                 description: Time slot for the booking
 *     responses:
 *       201:
 *         description: Booking added successfully
 *       400:
 *         description: Invalid request data
 *       500:
 *         description: Server error
 */
router.post('/bookings', addBooking);

/**
 * @swagger
 * /api/bookings:
 *   get:
 *     tags:
 *       - Bookings
 *     summary: Get all bookings
 *     responses:
 *       200:
 *         description: A list of all bookings
 *       500:
 *         description: Server error
 */
router.get('/bookings', getBookings);

/**
 * @swagger
 * /api/bookings/{userId}:
 *   get:
 *     tags:
 *       - Bookings
 *     summary: Get all bookings for a specific user
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: The ID of the user to fetch bookings for
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of the user's bookings
 *       404:
 *         description: No bookings found for the user
 *       500:
 *         description: Server error
 */
router.get('/bookings/:userId', getUserBookings);

/**
 * @swagger
 * /api/bookings/staff/{staffId}:
 *   get:
 *     tags:
 *       - Bookings
 *     summary: Get all bookings for a specific staff member
 *     parameters:
 *       - in: path
 *         name: staffId
 *         required: true
 *         description: The ID of the staff member to fetch bookings for
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of the staff member's bookings
 *       404:
 *         description: No bookings found or staff not found
 *       500:
 *         description: Server error
 */
router.get('/bookings/staff/:staffId', getStaffBookings);

/**
 * @swagger
 * /api/bookings/{id}/reschedule:
 *   put:
 *     tags:
 *       - Bookings
 *     summary: Reschedule a booking (only if status is 'pending' or 'inprogress')
 *     description: Allows rescheduling of a booking only if its status is 'pending' or 'inprogress'. Also updates future bookings for the same service if needed.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Booking ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newDate
 *               - newTimeSlot
 *             properties:
 *               newDate:
 *                 type: string
 *                 format: date
 *                 example: "2025-04-25"
 *               newTimeSlot:
 *                 type: string
 *                 example: "10AM - 11AM"
 *     responses:
 *       200:
 *         description: Booking rescheduled successfully
 *       400:
 *         description: Only bookings with status 'pending' or 'inprogress' can be rescheduled
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Internal server error
 */
router.put('/bookings/:id/reschedule', rescheduleBooking);

/**
 * @swagger
 * /api/bookings/{id}/status:
 *   put:
 *     tags:
 *       - Bookings
 *     summary: Update a booking's status
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the booking to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, completed, cancelled]
 *                 description: The new status of the booking
 *     responses:
 *       200:
 *         description: Booking status updated successfully
 *       400:
 *         description: Invalid status value
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Server error
 */
router.put('/bookings/:id/status', updateBookingStatus);

/**
 * @swagger
 * /api/bookings/{id}:
 *   delete:
 *     tags:
 *       - Bookings
 *     summary: Delete a booking
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the booking to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking deleted successfully
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Server error
 */
router.delete('/bookings/:id', deleteBooking);

module.exports = router;