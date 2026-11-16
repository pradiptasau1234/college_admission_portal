const multer = require('multer');
const path = require('path');

// Use memory storage for seamless cloud/serverless compatibility (e.g. Vercel)
const storage = multer.memoryStorage();

// File filter (PDF, JPG, JPEG, PNG)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype) || file.mimetype === 'application/pdf';

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only .pdf, .jpg, .jpeg, and .png files are accepted.'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: fileFilter
});

module.exports = upload;
