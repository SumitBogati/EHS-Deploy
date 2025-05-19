const express = require('express');
const { initiatePayment, handleKhaltiCallback, getPaymentById, updatePaymentStatus, deletePayment, getAllPayments} = require('../controllers/payment.controller');
const router = express.Router();

/**
 * @swagger
 * /api/payments/initiate:
 *   post:
 *     tags:
 *       - Payments
 *     summary: Initiate a payment for a service booking
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               serviceId:
 *                 type: string
 *                 description: ID of the service to book
 *               userId:
 *                 type: string
 *                 description: ID of the user making the booking
 *               date:
 *                 type: string
 *                 description: Desired booking date
 *               timeSlot:
 *                 type: string
 *                 description: Desired time slot
 *     responses:
 *       200:
 *         description: Payment initiated successfully
 */
router.post('/payments/initiate', initiatePayment);

/**
 * @swagger
 * /api/payments/verify:
 *   post:
 *     tags:
 *       - Payments
 *     summary: Verify a Khalti payment and create booking
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pidx:
 *                 type: string
 *                 description: Payment ID from Khalti
 *     responses:
 *       200:
 *         description: Payment verified and booking created successfully
 */
router.get('/payment/verify', handleKhaltiCallback);

/**
 * @swagger
 * /api/payments:
 *   get:
 *     tags:
 *       - Payments
 *     summary: Get all payments
 *     responses:
 *       200:
 *         description: List of all payments
 *       500:
 *         description: Error fetching payments
 */
router.get('/payments', getAllPayments);


/**
 * @swagger
 * /api/payments/{id}:
 *   get:
 *     tags:
 *       - Payments
 *     summary: Get a payment by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the payment to retrieve
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment found
 *       404:
 *         description: Payment not found
 */
router.get('/payments/:id', getPaymentById);

/**
 * @swagger
 * /api/payments/{id}:
 *   put:
 *     tags:
 *       - Payments
 *     summary: Update payment status
 *     description: This endpoint allows updating the status of a specific payment.
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the payment to update
 *         required: true
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
 *                 description: New status of the payment
 *                 enum: [initiated, completed, partial, refunded]
 *     responses:
 *       200:
 *         description: Payment status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 updatedPayment:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     status:
 *                       type: string
 *       404:
 *         description: Payment not found
 *       500:
 *         description: Server error
 */
router.put('/payments/:id', updatePaymentStatus);

/**
 * @swagger
 * /api/payments/{id}:
 *   delete:
 *     tags:
 *       - Payments
 *     summary: Delete a payment
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the payment to delete
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Payment deleted
 *       404:
 *         description: Payment not found
 */
router.delete('/payments/:id', deletePayment);

module.exports = router;