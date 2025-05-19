const Service = require('../models/service.model');
const Category = require('../models/category.model');
const Booking = require('../models/booking.model');
const Staff = require('../models/staff.model');
const fs = require('fs');
const path = require('path');

// Add Category
exports.addCategory = async (req, res) => {
  try {
    // Check Role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized. Only Admin can perform this action' });
    }

    const { name } = req.body;

    // Validate name: not empty, not whitespace-only
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Category name is required.' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Image is required' });
    }

    // Check if category already exists (case-insensitive)
    const existingCategory = await Category.findOne({ 
      name: { $regex: `^${name.trim()}$`, $options: 'i' } 
    });
    if (existingCategory) {
      return res.status(409).json({ error: 'Category already exists' });
    }

    // Capitalize the first letter of the trimmed name
    const capitalizedName = name.trim().charAt(0).toUpperCase() + name.trim().slice(1);

    // Save the category with the capitalized name and image path
    const category = new Category({
      name: capitalizedName,
      image: req.file.path,
    });

    await category.save();
    res.status(201).json({ message: 'Category added successfully', category });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update Category
exports.updateCategory = async (req, res) => {
  try {
    // Check Role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized. Only Admin can perform this action' });
    }

    const { id } = req.params;
    const { name } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // If the category name is being updated
    if (name && name.trim() !== category.name) {
      // Validate name: not empty, not whitespace-only
      if (!name || name.trim().length === 0) {
        return res.status(400).json({ error: 'Category name is required' });
      }

      // Check if new name already exists (case-insensitive)
      const existingCategory = await Category.findOne({ 
        name: { $regex: `^${name.trim()}$`, $options: 'i' },
        _id: { $ne: id } // Exclude the current category
      });
      if (existingCategory) {
        return res.status(409).json({ error: 'Category name already exists' });
      }

      const oldCategoryName = category.name; // Save the old category name
      // Capitalize the first letter of the trimmed name
      const capitalizedName = name.trim().charAt(0).toUpperCase() + name.trim().slice(1);
      category.name = capitalizedName; // Update with the capitalized name

      // Update the category name in all associated services
      await Service.updateMany(
        { category: oldCategoryName },
        { category: capitalizedName }
      );
    }

    if (req.file) {
      const oldImagePath = category.image;
      if (oldImagePath) {
        const fullOldImagePath = path.join(__dirname, '../', oldImagePath);
        if (fs.existsSync(fullOldImagePath)) {
          fs.unlinkSync(fullOldImagePath); // Delete the old image
        }
      }
      category.image = req.file.path; // Update with the new image path
    }

    // Save the updated category
    await category.save();
    res.status(200).json({ message: 'Category updated successfully', category });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete Category
exports.deleteCategory = async (req, res) => {
  try {
    //Check Role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized. Only Admin can perform this action' });
    }

    const { id } = req.params;
    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Find and delete all services associated with the category
    const servicesToDelete = await Service.find({ category: category.name });
    const serviceIds = servicesToDelete.map(service => service._id);
    await Service.deleteMany({ category: category.name });

    // Update related bookings
    await Booking.updateMany(
      { service: { $in: serviceIds } },
      {
        $set: {
          service: null,
          serviceName: 'Service Deleted',
        }
      }
    );

    // Update related staff
    await Staff.updateMany(
      { categoryId: id },
      {
        $set: {
          categoryId: null,
          category: 'Not Assigned',
        }
      }
    );

    // Delete the image from the server
    const imagePath = category.image;
    if (imagePath) {
      const fullImagePath = path.join(__dirname, '../', imagePath);
      if (fs.existsSync(fullImagePath)) {
        fs.unlinkSync(fullImagePath);
      } else {
        console.error(`Image not found at ${fullImagePath}`);
      }
    }

    // Delete the category itself
    await Category.findByIdAndDelete(id);

    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get All Categories
exports.getCategories = async (req, res) => {
  try {

    const categories = await Category.find();

    // For each category, count the number of services and add to the category
    const categoriesWithServiceCount = await Promise.all(categories.map(async (category) => {
      const serviceCount = await Service.countDocuments({ category: category.name });
      return {
        ...category.toObject(),
        totalServices: serviceCount,
      };
    }));

    res.status(200).json(categoriesWithServiceCount);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get a Single Category by ID
exports.getCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.status(200).json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};