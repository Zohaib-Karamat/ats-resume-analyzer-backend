import multer from 'multer';
import { ApiError } from '../utils/ApiError.js';

// ─── File Filter ──────────────────────────────────────────────────────────────
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Invalid file type. Only PDF and DOCX are allowed.'), false);
  }
};

// ─── Multer — Memory Storage ───────────────────────────────────────────────────
// Files are kept in-memory as buffers (req.file.buffer).
// No temp files are written to disk — Cloudinary receives the buffer directly.
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
  fileFilter,
});
