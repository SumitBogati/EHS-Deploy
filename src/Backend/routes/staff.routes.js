const express = require('express');
const { addStaff, updateStaff, updateStaffPassword, resetStaffPassword, deleteStaff, getAllStaff, getStaffById } = require('../controllers/staff.controller');
const { jwtAuthMiddleware } = require('../jwt'); // Import JWT middleware
const upload = require('../upload')('staff');

const router = express.Router();

/**
 * @swagger
 * /api/staff:
 *   get:
 *     tags:
 *       - Staff
 *     summary: Get a list of all staff
 *     responses:
 *       200:
 *         description: List of staff members
 *       500:
 *         description: Server error
 */
router.get('/staff', getAllStaff);

/**
 * @swagger
 * /api/staff/{id}:
 *   get:
 *     tags:
 *       - Staff
 *     summary: Get details of a single staff member by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the staff member to retrieve
 *     responses:
 *       200:
 *         description: Staff details
 *       404:
 *         description: Staff not found
 *       500:
 *         description: Server error
 */
router.get('/staff/:id', getStaffById);

/**
 * @swagger
 * /api/add-staff:
 *   post:
 *     tags:
 *       - Staff
 *     summary: Add a new staff member
 *     security:
 *       - bearerAuth: [] # Require JWT token
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the staff
 *               address:
 *                 type: string
 *                 description: Address of the staff
 *               phone:
 *                 type: string
 *                 description: Phone number of the staff (should start with 97 or 98 and 10 digits long)
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image of the staff
 *               categoryName:
 *                 type: string
 *                 description: Name of the category the staff belongs to (category name instead of category ID)
 *     responses:
 *       201:
 *         description: Staff added successfully
 *       400:
 *         description: Invalid input or duplicate phone number
 *       401:
 *         description: Unauthorized, invalid or missing token
 *       403:
 *         description: Forbidden, user is not an admin
 */
router.post('/add-staff', jwtAuthMiddleware, upload, addStaff);

/**
 * @swagger
 * /api/update-staff/{id}:
 *   put:
 *     tags:
 *       - Staff
 *     summary: Update staff details
 *     security:
 *       - bearerAuth: [] # Require JWT token
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Staff ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the staff
 *               address:
 *                 type: string
 *                 description: Address of the staff
 *               phone:
 *                 type: string
 *                 description: Phone number of the staff (should start with 97 or 98 and 10 digits long)
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image of the staff (optional)
 *               categoryName:
 *                 type: string
 *                 description: Name of the category the staff belongs to (category name instead of category ID)
 *     responses:
 *       200:
 *         description: Staff updated successfully
 *       400:
 *         description: Invalid phone number or staff not found
 *       401:
 *         description: Unauthorized, invalid or missing token
 *       403:
 *         description: Forbidden, user is not an admin
 *       404:
 *         description: Staff not found
 */
router.put('/update-staff/:id', jwtAuthMiddleware, upload, updateStaff);

/**
 * @swagger
 * /api/update-staff-password:
 *   post:
 *     tags:
 *       - Staff
 *     summary: Update password for a staff member
 *     description: Staff can update their password by verifying the old password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - staffId
 *               - phone
 *               - oldPassword
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               staffId:
 *                 type: string
 *                 example: 6620db189a33fc421eb4d978
 *               phone:
 *                 type: string
 *                 example: 9812345678
 *               oldPassword:
 *                 type: string
 *                 example: Staff@123
 *               newPassword:
 *                 type: string
 *                 example: NewSecure@2025
 *               confirmPassword:
 *                 type: string
 *                 example: NewSecure@2025
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       400:
 *         description: Validation error or password mismatch
 *       404:
 *         description: Staff not found
 *       500:
 *         description: Server error
 */
router.post('/update-staff-password', updateStaffPassword);

/**
 * @swagger
 * /api/reset-staff-password/{id}:
 *   post:
 *     tags:
 *       - Staff
 *     summary: Reset staff password to default
 *     description: Resets the password of a staff member to the default password (Staff@123) based on their ID.
 *     security:
 *       - bearerAuth: [] # Require JWT token
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the staff member whose password needs to be reset
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Password reset to default successfully
 *       401:
 *         description: Unauthorized, invalid or missing token
 *       403:
 *         description: Forbidden, user is not an admin
 *       404:
 *         description: Staff not found
 *       500:
 *         description: Server error
 */
router.post('/reset-staff-password/:id', jwtAuthMiddleware, resetStaffPassword);

/**
 * @swagger
 * /api/delete-staff/{id}:
 *   delete:
 *     tags:
 *       - Staff
 *     summary: Delete a staff member
 *     security:
 *       - bearerAuth: [] # Require JWT token
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Staff ID
 *     responses:
 *       200:
 *         description: Staff deleted successfully
 *       401:
 *         description: Unauthorized, invalid or missing token
 *       403:
 *         description: Forbidden, user is not an admin
 *       404:
 *         description: Staff not found
 */
router.delete('/delete-staff/:id', jwtAuthMiddleware, deleteStaff);

module.exports = router;