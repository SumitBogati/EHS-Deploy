const Service = require('../models/service.model');
const Category = require('../models/category.model');
const Booking = require('../models/booking.model');
const Payment = require('../models/payment.model');
const fs = require('fs');
const path = require('path');

// Add Service
exports.addService = async (req, res) => {
  try {
    // Check Role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized. Only Admin can perform this action' });
    }

    const { name, category, price, description } = req.body;

    // Validate inputs
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Service Name Required' });
    }
    if (!category || !price || !description) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (!description.trim()) {
      return res.status(400).json({ error: 'Description cannot be empty' });
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({ error: 'Price must be a valid non-negative number' });
    }
    if (parsedPrice < 500) {
      return res.status(400).json({ error: 'Price must be at least 500' });
    }

    // Check if the service name already exists for the given category (case-insensitive)
    const existingService = await Service.findOne({
      name: { $regex: `^${name.trim()}$`, $options: 'i' },
      category,
    });
    if (existingService) {
      return res.status(400).json({ error: 'Service name already exists for this category' });
    }

    // Check if the category name exists
    const existingCategory = await Category.findOne({ name: category });
    if (!existingCategory) {
      return res.status(400).json({ error: 'Invalid category name' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Image is required' });
    }

    // Capitalize the first letter of the trimmed name
    const capitalizedName = name.trim().charAt(0).toUpperCase() + name.trim().slice(1);

    const service = new Service({
      name: capitalizedName,
      category,
      price: parsedPrice,
      description,
      image: req.file.path,
    });

    await service.save();
    res.status(201).json({ message: 'Service added successfully', service });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get Top 3 Most Booked Services
exports.getTopBookedServices = async (req, res) => {
  try {
    // Aggregate bookings to count the number of bookings for each service
    const topServices = await Booking.aggregate([
      // Group by service and count the number of bookings
      {
        $group: {
          _id: "$service",
          count: { $sum: 1 }
        }
      },
      // Join with the services collection to retrieve service details
      {
        $lookup: {
          from: 'Services',
          localField: '_id',
          foreignField: '_id',
          as: 'serviceDetails'
        }
      },
      // Unwind the serviceDetails array to flatten the data
      {
        $unwind: "$serviceDetails"
      },
      // Project only the required fields: service ID, service name, image, and booking count
      {
        $project: {
          serviceId: "$serviceDetails._id",
          name: "$serviceDetails.name",
          image: "$serviceDetails.image",
          count: 1
        }
      },
      // Sort the results by booking count in descending order (most booked services first)
      {
        $sort: { count: -1 }
      },
      // Limit the results to the top 3 most booked services
      {
        $limit: 3
      }
    ]);

    // If no top services are found, return a 404 response with a message
    if (!topServices || topServices.length === 0) {
      return res.status(404).json({ message: 'No bookings found for services.' });
    }

    // Return the top 3 most booked services as a response
    res.status(200).json(topServices);
  } catch (error) {
    // Handle any errors that occur during the aggregation
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update Service
exports.updateService = async (req, res) => {
  try {
    // Check Role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized. Only Admin can perform this action' });
    }

    const { id } = req.params;
    const { name, category, price, description } = req.body;

    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    // Validate and update name if provided
    if (name && name.trim() !== service.name) {
      if (!name || name.trim().length === 0) {
        return res.status(400).json({ error: 'Service Name Required' });
      }
      // Check if new name already exists for the given category (case-insensitive)
      const existingService = await Service.findOne({
        name: { $regex: `^${name.trim()}$`, $options: 'i' },
        category: category || service.category,
        _id: { $ne: id } // Exclude the current service
      });
      if (existingService) {
        return res.status(400).json({ error: 'Service name already exists for this category' });
      }
      // Capitalize the first letter of the trimmed name
      service.name = name.trim().charAt(0).toUpperCase() + name.trim().slice(1);
    }

    // Validate and update category if provided
    if (category && category !== service.category) {
      if (!category) {
        return res.status(400).json({ error: 'Category is required' });
      }
      const existingCategory = await Category.findOne({ name: category });
      if (!existingCategory) {
        return res.status(400).json({ error: 'Invalid category name' });
      }
      service.category = category;
    }

    // Update price if provided
    if (price !== undefined) {
      const parsedPrice = parseFloat(price);
      if (isNaN(parsedPrice) || parsedPrice <= 0) {
        return res.status(400).json({ error: 'Price must be a positive number' });
      }
      service.price = parsedPrice;
    }

    if (price < 500) {
      return res.status(400).json({ error: 'Price must be at least 500' });
    }

    // Update description if provided
    if (description !== undefined) {
      if (!description.trim()) {
        return res.status(400).json({ error: 'Description cannot be empty' });
      }
      service.description = description;
    }

    // Update image if provided
    if (req.file) {
      const oldImagePath = service.image;
      if (oldImagePath) {
        const fullOldImagePath = path.join(__dirname, '../', oldImagePath);
        if (fs.existsSync(fullOldImagePath)) {
          fs.unlinkSync(fullOldImagePath); // Delete the old image
        }
      }
      service.image = req.file.path; // Update with the new image path
    }

    // Save the updated service
    await service.save();
    res.status(200).json({ message: 'Service updated successfully', service });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete Service
exports.deleteService = async (req, res) => {
  try {
    // Check Role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized. Only Admin can perform this action' });
    }

    const { id } = req.params;
    const service = await Service.findById(id);

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    // Delete the image
    const imagePath = service.image;
    if (imagePath) {
      const fullImagePath = path.join(__dirname, '../', imagePath);
      if (fs.existsSync(fullImagePath)) {
        fs.unlinkSync(fullImagePath);
      }
    }

    // Delete the service
    await Service.findByIdAndDelete(id);

    // Update related bookings to reflect service deletion
    await Booking.updateMany(
      { service: id },
      { $set: { serviceName: 'Service Deleted' } }
    );

    // Update related payments
    await Payment.updateMany(
      { service: id },
      { $set: { serviceName: 'Service Deleted' } }
    );

    res.status(200).json({ message: 'Service deleted and related bookings updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get All Services
exports.getServices = async (req, res) => {
  try {
    const services = await Service.find();
    res.status(200).json(services);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get a Single Service by ID
exports.getService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findById(id);

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    res.status(200).json(service);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};