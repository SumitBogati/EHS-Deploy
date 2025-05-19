const express = require('express');
const { changePassword } = require('../controllers/password.controller');

const router = express.Router();

/**
 * @swagger
 * /api/change-password:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Change user password
 *     description: Allows user to change password by validating the old one
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - oldPassword
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               userId:
 *                 type: string
 *                 example: 66063c2b9378c601a823e8a5
 *               oldPassword:
 *                 type: string
 *                 example: oldPassword123
 *               newPassword:
 *                 type: string
 *                 example: newSecurePassword123
 *               confirmPassword:
 *                 type: string
 *                 example: newSecurePassword123
 *     responses:
 *       '200':
 *         description: Password changed successfully
 *       '400':
 *         description: Validation error or incorrect old password
 *       '404':
 *         description: User not found
 */
router.post('/change-password', changePassword);

module.exports = router;