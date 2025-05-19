const bcrypt = require('bcrypt'); // for password hashing
const Staff = require('../models/staff.model');
const Category = require('../models/category.model');
const User = require('../models/user.model');
const fs = require('fs');
const path = require('path');

// Default password for all staff
const defaultPassword = 'Staff@123';

// Add Staff
exports.addStaff = async (req, res) => {
  try {
    const { name, address, phone, categoryName} = req.body;

    // Validate name and address
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Name is required and cannot be empty.' });
    }

    if (!address || address.trim() === '') {
      return res.status(400).json({ error: 'Address is required and cannot be empty.' });
    }


    // Validate phone number format
    const phoneRegex = /^(97|98)\d{8}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ error: 'Invalid phone number. It must start with 97 or 98 and be 10 digits long.' });
    }

    // Check if the phone already exists in Staff or User
    const phoneExistsInStaff = await Staff.findOne({ phone });
    const phoneExistsInUser = await User.findOne({ phoneNumber: phone });

    if (phoneExistsInStaff || phoneExistsInUser) {
      return res.status(400).json({ error: 'Phone number already in use' });
    }

    // Check if the category name exists in a case-insensitive manner
    const existingCategory = await Category.findOne({ name: new RegExp(`^${categoryName}$`, 'i') });
    if (!existingCategory) {
      return res.status(400).json({ error: 'Invalid category name' });
    }

    // Hash the default password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(defaultPassword, salt);

    // Check if an image was uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'Image is required.' });
    }

    // Validate image format (JPEG, JPG, PNG)
    const fileTypes = /jpeg|jpg|png/;
    const extname = fileTypes.test(path.extname(req.file.originalname).toLowerCase());
    const mimetype = fileTypes.test(req.file.mimetype);

    if (!extname || !mimetype) {
      return res.status(400).json({ error: 'Only JPEG, JPG, or PNG images are allowed.' });
    }

    // Create a new staff object
    const staff = new Staff({
      name,
      address,
      phone,
      password: hashedPassword,
      role: 'staff',
      image: req.file.path,
      categoryId: existingCategory._id,
      category: existingCategory.name,
    });

    await staff.save();
    res.status(201).json({ message: 'Staff added successfully', staff });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update Staff
exports.updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, phone, categoryName} = req.body;

    const staff = await Staff.findById(id);
    if (!staff) {
      return res.status(404).json({ error: 'Staff not found' });
    }

    // Check if phone is being updated
    if (phone && phone !== staff.phone) {
      const phoneRegex = /^(97|98)\d{8}$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({ error: 'Invalid phone number. It must start with 97 or 98 and be 10 digits long.' });
      }

      // Check if the phone number already exists (not the same as the current phone)
      const phoneExistsInStaff = await Staff.findOne({ phone });
      const phoneExistsInUser = await User.findOne({ phoneNumber: phone });

      if (phoneExistsInStaff || phoneExistsInUser) {
        return res.status(400).json({ error: 'Phone number already in use' });
      }

      staff.phone = phone; // Update phone number if valid and unique
    }

    // Update the name if provided and different from the existing name
    if (name && name !== staff.name) {
      staff.name = name;
    }

    // Log the category name received in the request
    console.log('Category Name received for update:', categoryName);

    // Validate and update category if provided
    if (categoryName && categoryName !== staff.category) {
      const existingCategory = await Category.findOne({ name: new RegExp(`^${categoryName}$`, 'i') });
      if (!existingCategory) {
        return res.status(400).json({ error: 'Invalid category name' });
      }
      staff.categoryId = existingCategory._id;
      staff.category = existingCategory.name;
    }

    // Update other fields like address
    if (address) staff.address = address;

    // If image is updated, delete the old image and save the new one
    if (req.file) {
      // Validate image format (JPEG, JPG, PNG)
      const fileTypes = /jpeg|jpg|png/;
      const extname = fileTypes.test(path.extname(req.file.originalname).toLowerCase());
      const mimetype = fileTypes.test(req.file.mimetype);

      if (!extname || !mimetype) {
        return res.status(400).json({ error: 'Only JPEG, JPG, or PNG images are allowed.' });
      }

      // If image is updated, delete the old image and save the new one
      const oldImagePath = staff.image;
      if (oldImagePath) {
        const fullOldImagePath = path.join(__dirname, '../', oldImagePath);
        if (fs.existsSync(fullOldImagePath)) {
          fs.unlinkSync(fullOldImagePath); // Delete the old image
        }
      }
      staff.image = req.file.path; // Update with the new image path
    }

    await staff.save();
    res.status(200).json({ message: 'Staff updated successfully', staff });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateStaffPassword = async (req, res) => {
  try {
    const { staffId, phone, oldPassword, newPassword, confirmPassword } = req.body;

    if (!staffId || !phone || !oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: 'All fields are required: staffId, phone, oldPassword, newPassword, confirmPassword.' });
    }

    // Password validation
    const passwordRegex = /^(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long and contain at least one special character.' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'New password and confirm password do not match.' });
    }

    const staff = await Staff.findOne({ _id: staffId, phone });
    if (!staff) {
      return res.status(404).json({ error: 'Staff not found with provided ID and phone.' });
    }

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, staff.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Old password is incorrect.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    staff.password = hashedPassword;
    await staff.save();

    res.status(200).json({ message: 'Password updated successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Reset Staff Password to Default
exports.resetStaffPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const defaultPassword = 'Staff@123';

    const staff = await Staff.findById(id);
    if (!staff) {
      return res.status(404).json({ error: 'Staff not found' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(defaultPassword, salt);

    staff.password = hashedPassword;
    await staff.save();

    res.status(200).json({ message: 'Password reset to default successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete Staff
exports.deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const staff = await Staff.findById(id);

    if (!staff) {
      return res.status(404).json({ error: 'Staff not found' });
    }

    // Delete image file from server
    const imagePath = staff.image;
    if (imagePath) {
      const fullImagePath = path.join(__dirname, '../', imagePath);
      if (fs.existsSync(fullImagePath)) {
        fs.unlinkSync(fullImagePath); // Delete image file
      }
    }

    await Staff.findByIdAndDelete(id);
    res.status(200).json({ message: 'Staff deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all Staff
exports.getAllStaff = async (req, res) => {
  try {
      const staff = await Staff.find().populate('categoryId', 'name');
      res.status(200).json(staff);
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
  }
};

// Get Single Staff by ID
exports.getStaffById = async (req, res) => {
  try {
      const { id } = req.params;
      const staff = await Staff.findById(id).populate('categoryId', 'name');
      if (!staff) {
          return res.status(404).json({ error: 'Staff not found' });
      }
      res.status(200).json(staff);
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
  }
};
