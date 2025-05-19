const express = require('express');
const { forgotPassword, verifyResetCode } = require('../controllers/forgotPassword.controller');

const router = express.Router();

/**
 * @swagger
 * /api/forgot-password:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Request a password reset verification code
 *     description: Endpoint to request a password reset verification code
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: User's email address
 *     responses:
 *       '200':
 *         description: Verification code sent successfully
 *       '404':
 *         description: User not found
 *       '500':
 *         description: Server error
 */
router.post('/forgot-password', forgotPassword);

/**
 * @swagger
 * /api/verify-reset-code:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Verify the reset password code and reset the password
 *     description: Endpoint to verify the reset code and allow the user to change their password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: User's email address
 *               code:
 *                 type: string
 *                 description: The verification code sent to the user's email
 *               newPassword:
 *                 type: string
 *                 description: New password
 *               confirmNewPassword:
 *                 type: string
 *                 description: Confirm new password
 *     responses:
 *       '200':
 *         description: Password reset successfully
 *       '400':
 *         description: Invalid verification code or passwords do not match
 *       '500':
 *         description: Server error
 */
router.post('/verify-reset-code', verifyResetCode);

module.exports = router;