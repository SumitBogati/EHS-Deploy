const express = require('express');
const { addService, updateService, deleteService, getServices, getService, getTopBookedServices } = require('../controllers/service.controller');
const { jwtAuthMiddleware } = require("../jwt");
const upload = require('../upload')('service');

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
 *         description: Service ID
 *     responses:
 *       200:
 *         description: Service details
 *       404:
 *         description: Service not found
 */
router.get('/service/:id', getService);

/**
 * @swagger
 * /api/add-service:
 *   post:
 *     tags:
 *       - Services
 *     summary: Add a new service
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Service name
 *               category:
 *                 type: string
 *                 description: Category name
 *               price:
 *                 type: number
 *                 description: Price of the service in Rs.
 *               description:
 *                 type: string
 *                 description: Description of the service
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image of the service
 *     responses:
 *       201:
 *         description: Service added successfully
 *       400:
 *         description: Invalid input or category not found
 */
router.post('/add-service',jwtAuthMiddleware ,upload, addService);

/**
 * @swagger
 * /api/services/top-booked:
 *   get:
 *     tags:
 *       - Services
 *     summary: Get top 3 most booked services
 *     description: Retrieves the top 3 most booked services based on the number of bookings.
 *     responses:
 *       '200':
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
 *                   count:
 *                     type: integer
 *                     description: Number of bookings for the service
 *       '404':
 *         description: No bookings found for services
 *       '500':
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
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
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
 *                 description: Service name
 *               category:
 *                 type: string
 *                 description: Category name (optional, only required if being updated)
 *               price:
 *                 type: number
 *                 description: Price of the service in Rs.
 *               description:
 *                 type: string
 *                 description: Description of the service
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: New image of the service (optional)
 *     responses:
 *       200:
 *         description: Service updated successfully
 *       404:
 *         description: Service not found
 */
router.put('/update-service/:id',jwtAuthMiddleware, upload, updateService);

/**
 * @swagger
 * /api/delete-service/{id}:
 *   delete:
 *     tags:
 *       - Services
 *     summary: Delete a service
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Service ID
 *     responses:
 *       200:
 *         description: Service deleted successfully
 *       404:
 *         description: Service not found
 */
router.delete('/delete-service/:id',jwtAuthMiddleware, deleteService);

module.exports = router;