const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Function to create multer storage dynamically based on the type
function createMulterUpload(type) {
  // Define Cloudinary storage
  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: (req, file) => {
      let folder = '';

      // Set folder based on type
      if (type === 'category') {
        folder = 'categories';
      } else if (type === 'service') {
        folder = 'services';
      } else if (type === 'staff') {
        folder = 'staff';
      } else {
        throw new Error('Invalid type specified. Must be "category", "service", or "staff".');
      }

      return {
        folder: folder,
        public_id: `${Date.now()}-${Math.round(Math.random() * 1e9)}`, // Unique file name
        allowed_formats: ['jpeg', 'jpg', 'png'],
      };
    },
  });

  return multer({
    storage,
    fileFilter: (req, file, cb) => {
      // Allowed file types
      const fileTypes = /jpeg|jpg|png/;
      const extname = fileTypes.test(file.originalname.toLowerCase().split('.').pop());
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

module.exports = createMulterUpload;