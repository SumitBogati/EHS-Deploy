const express = require('express');
const { addCategory, updateCategory, deleteCategory, getCategories, getCategory } = require('../controllers/category.controller');
const { jwtAuthMiddleware } = require("../jwt");
const createMulterUpload = require('../upload');

// Initialize upload middleware for category
const upload = createMulterUpload('category');

const router = express.Router();

/**
 * @swagger
 * /api/categories:
 *   get:
 *     tags:
 *       - Categories
 *     summary: Get all categories
 *     responses:
 *       200:
 *         description: A list of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 */
router.get('/categories', getCategories);

/**
 * @swagger
 * /api/category/{id}:
 *   get:
 *     tags:
 *       - Categories
 *     summary: Get a single category by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category details
 *       404:
 *         description: Category not found
 */
router.get('/category/:id', getCategory);

/**
 * @swagger
 * /api/add-category:
 *   post:
 *     tags:
 *       - Categories
 *     summary: Add a new category
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Category name
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image of the category
 *     responses:
 *       201:
 *         description: Category added successfully
 *       400:
 *         description: Invalid input or duplicate category name
 */
router.post('/add-category',jwtAuthMiddleware, upload, addCategory);

/**
 * @swagger
 * /api/update-category/{id}:
 *   put:
 *     tags:
 *       - Categories
 *     summary: Update category details
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Category ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Category name
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: New image of the category
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       404:
 *         description: Category not found
 *       400:
 *         description: Duplicate category name
 */
router.put('/update-category/:id',jwtAuthMiddleware, upload, updateCategory);

/**
 * @swagger
 * /api/delete-category/{id}:
 *   delete:
 *     tags:
 *       - Categories
 *     summary: Delete a category
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       404:
 *         description: Category not found
 */
router.delete('/delete-category/:id',jwtAuthMiddleware ,deleteCategory);

module.exports = router