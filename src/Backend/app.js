const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const routes = require('./routes/index.routes'); // Importing index routes
const path = require('path');

// Load environment variables from .env file
dotenv.config();

// Create an instance of Express
const app = express();

// Middleware for parsing JSON requests and enabling CORS
app.use(express.json());
app.use(morgan('dev'));
app.use(cors());

app.use(cors({
  origin: 'https://your-frontend-site.netlify.app'
}));

// Swagger setup
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EasyHomeServices API',
      version: '1.0.0',
      description: 'API for managing Easy Home Services',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./routes/*.js', './models/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec)); // Swagger middleware

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to the database
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

// Use routes
app.use('/api', routes);

app.get('/', (req, res) => {
  res.send('Welcome to Easy Home Services API');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});

module.exports = app;