const express = require('express');
const { addService, updateService, deleteService, getServices, getService, getTopBookedServices } = require('../controllers/service.controller');
const { jwtAuthMiddleware } = require('../jwt');
const createMulterUpload = require('../upload');

// Initialize upload middleware for service
const upload = createMulterUpload('service');

const router = express.Router();

/**
 * @swagger
 * /api/services:
 *   get:
 *     tags:
 *       - Services
 *     summary: Get all services
 *     responses:
 *       200:
 *         description: A list of services
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Service'
 *       500:
 *         description: Server error
 */
router.get('/services', getServices);

/**
 * @swagger
 * /api/service/{id}:
 *   get:
 *     tags:
 *       - Services
 *     summary: Get a single service by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Service ID
 *     responses:
 *       200:
 *         description: Service details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Service'
 *       404:
 *         description: Service not found
 *       500:
 *         description: Server error
 */
router.get('/service/:id', getService);

/**
 * @swagger
 * /api/add-service:
 *   post:
 *     tags:
 *       - Services
 *     summary: Add a new service
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category
 *               - price
 *               - description
 *               - image
 *             properties:
 *               name:
 *                 type: string
 *                 description: Service name
 *               category:
 *                 type: string
 *                 description: Name of an existing category
 *               price:
 *                 type: number
 *                 description: Price of the service in Rs. (minimum 500)
 *               description:
 *                 type: string
 *                 description: Description of the service
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image of the service (JPEG, JPG, or PNG)
 *     responses:
 *       201:
 *         description: Service added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 service:
 *                   $ref: '#/components/schemas/Service'
 *       400:
 *         description: Invalid input, missing fields, or invalid category
 *       403:
 *         description: Unauthorized, admin access required
 *       409:
 *         description: Service name already exists for this category
 *       500:
 *         description: Server error
 */
router.post('/add-service', jwtAuthMiddleware, upload, addService);

/**
 * @swagger
 * /api/services/top-booked:
 *   get:
 *     tags:
 *       - Services
 *     summary: Get top 3 most booked services
 *     description: Retrieves the top 3 most booked services based on the number of bookings
 *     responses:
 *       200:
 *         description: Successfully retrieved top 3 most booked services
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   serviceId:
 *                     type: string
 *                     description: Service ID
 *                   name:
 *                     type: string
 *                     description: Name of the service
 *                   image:
 *                     type: string
 *                     description: URL of the service image
 *                   count:
 *                     type: integer
 *                     description: Number of bookings for the service
 *       404:
 *         description: No bookings found for services
 *       500:
 *         description: Server error
 */
router.get('/services/top-booked', getTopBookedServices);

/**
 * @swagger
 * /api/update-service/{id}:
 *   put:
 *     tags:
 *       - Services
 *     summary: Update service details
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Service ID
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Service name (optional)
 *               category:
 *                 type: string
 *                 description: Name of an existing category (optional)
 *               price:
 *                 type: number
 *                 description: Price of the service in Rs. (minimum 500, optional)
 *               description:
 *                 type: string
 *                 description: Description of the service (optional)
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: New image of the service (JPEG, JPG, or PNG, optional)
 *     responses:
 *       200:
 *         description: Service updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 service:
 *                   $ref: '#/components/schemas/Service'
 *       400:
 *         description: Invalid input, missing required fields, or invalid category
 *       403:
 *         description: Unauthorized, admin access required
 *       404:
 *         description: Service not found
 *       409:
 *         description: Service name already exists for this category
 *       500:
 *         description: Server error
 */
router.put('/update-service/:id', jwtAuthMiddleware, upload, updateService);

/**
 * @swagger
 * /api/delete-service/{id}:
 *   delete:
 *     tags:
 *       - Services
 *     summary: Delete a service
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Service ID
 *     responses:
 *       200:
 *         description: Service deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       403:
 *         description: Unauthorized, admin access required
 *       404:
 *         description: Service not found
 *       500:
 *         description: Server error
 */
router.delete('/delete-service/:id', jwtAuthMiddleware, deleteService);

module.exports = router;