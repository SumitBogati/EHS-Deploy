const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, updateUser, deleteUser } = require('../controllers/user.controller');

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get all users with role "user"
 *     description: Retrieve only users who have the role of "user".
 *     responses:
 *       '200':
 *         description: Successfully retrieved users with role "user"
 *       '500':
 *         description: Server error
 */
router.get('/users', getAllUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get a user by ID
 *     description: Retrieve a user by their ID.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the user
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successfully retrieved the user
 *       '404':
 *         description: User not found
 *       '500':
 *         description: Server error
 */
router.get('/users/:id', getUserById);

/**
 * @swagger
 * /api/update-users/{id}:
 *   put:
 *     tags:
 *       - Users
 *     summary: Update user details
 *     description: Update user information. Only the provided fields will be updated. Email cannot be updated.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the user to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *                 description: Must be unique
 *               address:
 *                 type: string
 *     responses:
 *       '200':
 *         description: User updated successfully
 *       '400':
 *         description: Validation error or phone number already exists
 *       '404':
 *         description: User not found
 *       '500':
 *         description: Server error
 */
router.put('/update-users/:id', updateUser);

/**
 * @swagger
 * /api/delete-user/{id}:
 *   delete:
 *     tags:
 *       - Users
 *     summary: Delete a user
 *     description: Delete a user from the system.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the user to delete
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: User deleted successfully
 *       '404':
 *         description: User not found
 *       '500':
 *         description: Server error
 */
router.delete('/delete-user/:id', deleteUser);

module.exports = router;