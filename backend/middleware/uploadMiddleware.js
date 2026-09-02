const multer = require('multer');

const storage = multer.memoryStorage();

const path = require('path');

const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const isImageMimetype = file.mimetype.startsWith('image/');
  const isImageExtension = allowedExtensions.includes(ext);

  if (isImageMimetype || isImageExtension) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB per file
});

module.exports = upload;