const bcrypt = require('bcrypt');
const Staff = require('../models/staff.model');
const Category = require('../models/category.model');
const User = require('../models/user.model');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary (optional if already configured in upload.js)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Default password for staff
const defaultPassword = 'Staff@123';

// Add Staff
exports.addStaff = async (req, res) => {
  try {
    // Check Role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized. Only Admin can perform this action' });
    }

    const { name, address, phone, categoryName } = req.body;

    // Validate inputs
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Name is required' });
    }
    if (!address || address.trim().length === 0) {
      return res.status(400).json({ error: 'Address is required' });
    }
    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }
    if (!categoryName) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    // Validate phone number format
    const phoneRegex = /^(97|98)\d{8}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ error: 'Invalid phone number. It must start with 97 or 98 and be 10 digits long' });
    }

    // Check if phone already exists in Staff or User
    const phoneExistsInStaff = await Staff.findOne({ phone });
    const phoneExistsInUser = await User.findOne({ phoneNumber: phone });
    if (phoneExistsInStaff || phoneExistsInUser) {
      return res.status(409).json({ error: 'Phone number already in use' });
    }

    // Check if category exists (case-insensitive)
    const existingCategory = await Category.findOne({ name: { $regex: `^${categoryName.trim()}$`, $options: 'i' } });
    if (!existingCategory) {
      return res.status(400).json({ error: 'Invalid category name' });
    }

    // Check if image was uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'Image is required' });
    }

    // Capitalize the first letter of the trimmed name
    const capitalizedName = name.trim().charAt(0).toUpperCase() + name.trim().slice(1);

    // Hash the default password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(defaultPassword, salt);

    // Create new staff
    const staff = new Staff({
      name: capitalizedName,
      address: address.trim(),
      phone,
      password: hashedPassword,
      role: 'staff',
      image: req.file.path, // Cloudinary URL
      categoryId: existingCategory._id,
      category: existingCategory.name,
    });

    await staff.save();
    res.status(201).json({ message: 'Staff added successfully', staff });
  } catch (error) {
    console.error('Error adding staff:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update Staff
exports.updateStaff = async (req, res) => {
  try {
    // Check Role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized. Only Admin can perform this action' });
    }

    const { id } = req.params;
    const { name, address, phone, categoryName } = req.body;

    const staff = await Staff.findById(id);
    if (!staff) {
      return res.status(404).json({ error: 'Staff not found' });
    }

    // Validate and update name if provided
    if (name && name.trim() !== staff.name) {
      if (!name || name.trim().length === 0) {
        return res.status(400).json({ error: 'Name is required' });
      }
      staff.name = name.trim().charAt(0).toUpperCase() + name.trim().slice(1);
    }

    // Validate and update address if provided
    if (address && address.trim() !== staff.address) {
      if (!address || address.trim().length === 0) {
        return res.status(400).json({ error: 'Address is required' });
      }
      staff.address = address.trim();
    }

    // Validate and update phone if provided
    if (phone && phone !== staff.phone) {
      const phoneRegex = /^(97|98)\d{8}$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({ error: 'Invalid phone number. It must start with 97 or 98 and be 10 digits long' });
      }
      const phoneExistsInStaff = await Staff.findOne({ phone, _id: { $ne: id } });
      const phoneExistsInUser = await User.findOne({ phoneNumber: phone });
      if (phoneExistsInStaff || phoneExistsInUser) {
        return res.status(409).json({ error: 'Phone number already in use' });
      }
      staff.phone = phone;
    }

    // Validate and update category if provided
    if (categoryName && categoryName !== staff.category) {
      const existingCategory = await Category.findOne({ name: { $regex: `^${categoryName.trim()}$`, $options: 'i' } });
      if (!existingCategory) {
        return res.status(400).json({ error: 'Invalid category name' });
      }
      staff.categoryId = existingCategory._id;
      staff.category = existingCategory.name;
    }

    // Update image if provided
    if (req.file) {
      if (staff.image) {
        const publicId = staff.image.split('/').pop().split('.')[0]; // Extract public_id
        await cloudinary.uploader.destroy(`staff/${publicId}`);
      }
      staff.image = req.file.path; // Update with new Cloudinary URL
    }

    await staff.save();
    res.status(200).json({ message: 'Staff updated successfully', staff });
  } catch (error) {
    console.error('Error updating staff:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update Staff Password
exports.updateStaffPassword = async (req, res) => {
  try {
    const { staffId, phone, oldPassword, newPassword, confirmPassword } = req.body;

    // Validate inputs
    if (!staffId || !phone || !oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: 'All fields are required: staffId, phone, oldPassword, newPassword, confirmPassword' });
    }

    // Password validation
    const passwordRegex = /^(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long and contain at least one special character' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'New password and confirm password do not match' });
    }

    const staff = await Staff.findOne({ _id: staffId, phone });
    if (!staff) {
      return res.status(404).json({ error: 'Staff not found with provided ID and phone' });
    }

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, staff.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Old password is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    staff.password = hashedPassword;
    await staff.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating staff password:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Reset Staff Password to Default
exports.resetStaffPassword = async (req, res) => {
  try {
    // Check Role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized. Only Admin can perform this action' });
    }

    const { id } = req.params;

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
    console.error('Error resetting staff password:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete Staff
exports.deleteStaff = async (req, res) => {
  try {
    // Check Role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized. Only Admin can perform this action' });
    }

    const { id } = req.params;
    const staff = await Staff.findById(id);

    if (!staff) {
      return res.status(404).json({ error: 'Staff not found' });
    }

    // Delete image from Cloudinary
    if (staff.image) {
      const publicId = staff.image.split('/').pop().split('.')[0]; // Extract public_id
      await cloudinary.uploader.destroy(`staff/${publicId}`);
    }

    await Staff.findByIdAndDelete(id);
    res.status(200).json({ message: 'Staff deleted successfully' });
  } catch (error) {
    console.error('Error deleting staff:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get All Staff
exports.getAllStaff = async (req, res) => {
  try {
    const staff = await Staff.find().populate('categoryId', 'name');
    res.status(200).json(staff);
  } catch (error) {
    console.error('Error getting all staff:', error);
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
    console.error('Error getting staff by ID:', error);
    res.status(500).json({ error: 'Server error' });
  }
};