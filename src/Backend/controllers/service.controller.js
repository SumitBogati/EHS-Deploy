const Service = require('../models/service.model');
const Category = require('../models/category.model');
const Booking = require('../models/booking.model');
const Payment = require('../models/payment.model');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary (optional if already configured in upload.js)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
      return res.status(400).json({ error: 'Service name is required' });
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
      return res.status(409).json({ error: 'Service name already exists for this category' });
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
      image: req.file.path, // Cloudinary URL
    });

    await service.save();
    res.status(201).json({ message: 'Service added successfully'});
  } catch (error) {
    console.error('Error adding service:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get Top 3 Most Booked Services
exports.getTopBookedServices = async (req, res) => {
  try {
    const topServices = await Booking.aggregate([
      {
        $group: {
          _id: '$service',
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'services', // Ensure collection name matches your MongoDB setup
          localField: '_id',
          foreignField: '_id',
          as: 'serviceDetails',
        },
      },
      {
        $unwind: '$serviceDetails',
      },
      {
        $project: {
          serviceId: '$serviceDetails._id',
          name: '$serviceDetails.name',
          image: '$serviceDetails.image',
          count: 1,
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 3,
      },
    ]);

    if (!topServices || topServices.length === 0) {
      return res.status(404).json({ message: 'No bookings found for services' });
    }

    res.status(200).json(topServices);
  } catch (error) {
    console.error('Error getting top booked services:', error);
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
        return res.status(400).json({ error: 'Service name is required' });
      }
      const existingService = await Service.findOne({
        name: { $regex: `^${name.trim()}$`, $options: 'i' },
        category: category || service.category,
        _id: { $ne: id },
      });
      if (existingService) {
        return res.status(409).json({ error: 'Service name already exists for this category' });
      }
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

      // Update related bookings with the new category
      await Booking.updateMany(
        { service: id },
        { $set: { category: category } }
      );
    }

    // Update price if provided
    if (price !== undefined) {
      const parsedPrice = parseFloat(price);
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        return res.status(400).json({ error: 'Price must be a valid non-negative number' });
      }
      if (parsedPrice < 500) {
        return res.status(400).json({ error: 'Price must be at least 500' });
      }
      service.price = parsedPrice;
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
      if (service.image) {
        const publicId = service.image.split('/').pop().split('.')[0]; // Extract public_id
        await cloudinary.uploader.destroy(`services/${publicId}`);
      }
      service.image = req.file.path; // Update with new Cloudinary URL
    }

    await service.save();
    res.status(200).json({ message: 'Service updated successfully', service });
  } catch (error) {
    console.error('Error updating service:', error);
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

    // Delete the image from Cloudinary
    if (service.image) {
      const publicId = service.image.split('/').pop().split('.')[0]; // Extract public_id
      await cloudinary.uploader.destroy(`services/${publicId}`);
    }

    // Update related bookings
    await Booking.updateMany(
      { service: id },
      {
        $set: {
          service: null,
          serviceName: 'Service Deleted',
        },
      }
    );

    // Update related payments
    await Payment.updateMany(
      { service: id },
      {
        $set: {
          service: null,
          serviceName: 'Service Deleted',
        },
      }
    );

    // Delete the service
    await Service.findByIdAndDelete(id);

    res.status(200).json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get All Services
exports.getServices = async (req, res) => {
  try {
    const services = await Service.find();
    res.status(200).json(services);
  } catch (error) {
    console.error('Error getting services:', error);
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
    console.error('Error getting service:', error);
    res.status(500).json({ error: 'Server error' });
  }
};