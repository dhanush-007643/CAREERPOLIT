const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const config = require('./env');

const hasCloudinaryCredentials = Boolean(
  config.cloudinary.cloudName && config.cloudinary.apiKey && config.cloudinary.apiSecret
);

if (hasCloudinaryCredentials) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
    secure: true
  });
  console.log('[Cloudinary] Configured successfully');
} else {
  console.warn('[Storage] Cloudinary credentials not fully supplied. Local file storage will be active.');
}

const uploadsDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  try {
    fs.mkdirSync(uploadsDir, { recursive: true });
  } catch (err) {
    // Ignore error in readonly environments
  }
}

const uploadToCloudinary = async (fileBuffer, originalName, folder = 'careerpilot/resumes') => {
  if (!hasCloudinaryCredentials) {
    // Genuine local file storage provider (B30)
    const ext = path.extname(originalName) || '.pdf';
    const baseName = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = `${Date.now()}_${baseName}${ext}`;
    const filePath = path.join(uploadsDir, fileName);

    if (fileBuffer) {
      fs.writeFileSync(filePath, fileBuffer);
    }

    return {
      secure_url: `/uploads/${fileName}`,
      public_id: `local_${fileName}`,
      format: ext.replace('.', '') || 'pdf',
      bytes: fileBuffer ? fileBuffer.length : 0,
      resource_type: 'raw'
    };
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
        public_id: `${Date.now()}_${originalName.replace(/[^a-zA-Z0-9]/g, '_')}`
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(fileBuffer);
  });
};

const deleteFromCloudinary = async (publicId, resourceType = 'raw') => {
  if (!publicId) return { result: 'ok' };

  if (publicId.startsWith('local_')) {
    const fileName = publicId.replace('local_', '');
    const filePath = path.join(uploadsDir, fileName);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.warn(`[Storage] Could not remove local file: ${err.message}`);
      }
    }
    return { result: 'ok' };
  }

  if (!hasCloudinaryCredentials) {
    return { result: 'ok' };
  }

  try {
    return await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (error) {
    console.error(`[Cloudinary] Delete failed: ${error.message}`);
    throw error;
  }
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
  deleteFromCloudinary
};
