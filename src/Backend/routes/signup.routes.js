const express = require('express');
const { createUserValidator } = require('../validators/signup.validator');
const { createUser, verifyCode } = require('../controllers/signup.controller');

const router = express.Router();

/**
 * @swagger
 * /api/signup:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Register a new user
 *     description: Endpoint to create a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       '201':
 *         description: User created successfully
 *       '400':
 *         description: Validation error
 */
router.post('/signup', createUserValidator, createUser);

/**
 * @swagger
 * /api/verify-code:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Verify the user's verification code
 *     description: Endpoint to verify the verification code sent to the user's email
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
 *     responses:
 *       '200':
 *         description: Email verified successfully
 *       '400':
 *         description: Invalid or expired verification code
 */
router.post('/verify-code', verifyCode); // Add the route to verify the code

module.exports = router;