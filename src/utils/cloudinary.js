import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

// ─── Lazy Configuration ───────────────────────────────────────────────────────
// cloudinary.config() is called inside each function (not at module load time)
// so that process.env variables are guaranteed to be populated by dotenv first.
const getCloudinaryInstance = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  return cloudinary;
};

/**
 * Upload a file buffer to Cloudinary.
 *
 * @param {Buffer} buffer       - Raw file buffer from multer memoryStorage
 * @param {string} originalName - Original file name (used to derive public_id)
 * @param {string} mimeType     - MIME type of the file (pdf / docx)
 * @returns {Promise<{secure_url: string, public_id: string}>}
 */
export const uploadToCloudinary = (buffer, originalName, mimeType) => {
  return new Promise((resolve, reject) => {
    const client = getCloudinaryInstance();

    // Strip extension for the public_id; Cloudinary appends its own format info
    const baseName = originalName.replace(/\.[^/.]+$/, '');
    const sanitizedName = baseName.replace(/\s+/g, '_').toLowerCase();
    const timestamp = Date.now();

    const uploadStream = client.uploader.upload_stream(
      {
        folder: 'ats-resumes',
        public_id: `${sanitizedName}_${timestamp}`,
        resource_type: 'raw', // Required for non-image files (PDF, DOCX)
        use_filename: false,
        overwrite: false,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({ secure_url: result.secure_url, public_id: result.public_id });
      }
    );

    // Pipe the in-memory buffer into Cloudinary's upload stream
    const readable = Readable.from(buffer);
    readable.pipe(uploadStream);
  });
};

/**
 * Delete a file from Cloudinary by its public_id.
 *
 * @param {string} publicId - The Cloudinary public_id of the asset
 * @returns {Promise<void>}
 */
export const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return;
  const client = getCloudinaryInstance();
  await client.uploader.destroy(publicId, { resource_type: 'raw' });
};
