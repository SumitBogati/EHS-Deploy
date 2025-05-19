const express = require('express');
const { login } = require('../controllers/login.controller');
const { loginUserValidator } = require('../validators/login.validator');

const router = express.Router();

/**
 * @swagger
 * /api/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: User or staff login
 *     description: Login endpoint for users (via email) or staff (via phone number). Phone numbers must start with 97 or 98 and be 10 digits long.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: User's email or staff's phone number (must start with 97 or 98 and be 10 digits)
 *               password:
 *                 type: string
 *                 description: User's or staff's password
 *     responses:
 *       '200':
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     phoneNumber:
 *                       type: string
 *                     address:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                 token:
 *                   type: string
 *       '400':
 *         description: Invalid input (e.g., invalid phone number format)
 *       '401':
 *         description: Invalid credentials
 *       '404':
 *         description: Account does not exist
 *       '500':
 *         description: Server error
 */
router.post('/login', loginUserValidator, login);

module.exports = router;