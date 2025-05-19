const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Function to create multer storage dynamically based on the type
function createMulterUpload(type) {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      let dir = '';

      // Set folder based on type
      if (type === 'category') {
        dir = 'uploads/categories/';
      } else if (type === 'service') {
        dir = 'uploads/services/';
      } else if (type === 'staff') {
        dir = 'uploads/staff/';
      } else {
        return cb(new Error('Invalid type specified. Must be "category", "service", or "staff".'));
      }

      // Check if the directory exists, if not, create it
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true }); // Create the directory and any missing parent directories
      }

      cb(null, dir); // Set the destination directory
    },
    filename: (req, file, cb) => {
      // Generate a unique file name
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    },
  });

  return multer({
    storage,
    fileFilter: (req, file, cb) => {
      // Allowed file types
      const fileTypes = /jpeg|jpg|png/;
      const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = fileTypes.test(file.mimetype);

      // Validate file type
      if (extname && mimetype) {
        return cb(null, true);
      } else {
        cb(new Error('Only images in JPEG, JPG, or PNG formats are allowed'));
      }
    },
  }).single('image'); // Accept a single file with the field name 'image'
}

// Export the function to create the middleware dynamically
module.exports = createMulterUpload;