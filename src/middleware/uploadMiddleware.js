const multer = require('multer');
const { BadRequestError } = require('../utils/customErrors');

// Store files in memory so they can be streamed directly to Cloudinary or processed
const storage = multer.memoryStorage();

const resumeFileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  const allowedExtensions = ['.pdf', '.doc', '.docx'];
  const ext = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));

  if (allowedMimeTypes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new BadRequestError(
        'Invalid file type. Only PDF, DOC, and DOCX files are allowed for resume upload.',
        'INVALID_FILE_TYPE'
      ),
      false
    );
  }
};

const imageFileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new BadRequestError(
        'Invalid image type. Only JPEG, PNG, and WebP images are allowed.',
        'INVALID_IMAGE_TYPE'
      ),
      false
    );
  }
};

const uploadResume = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: resumeFileFilter
}).single('resume');

const uploadImage = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: imageFileFilter
}).single('image');

module.exports = {
  uploadResume,
  uploadImage
};
