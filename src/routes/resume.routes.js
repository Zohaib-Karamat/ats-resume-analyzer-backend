import { Router } from 'express';
import {
  uploadResume,
  getMyResumes,
  getResume,
  deleteResume,
  serveResumeFile,
  downloadResume,
} from '../controllers/resume.controller.js';
import { verifyJWT } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = Router();

// All resume routes require authentication
router.use(verifyJWT);

router.post('/upload', upload.single('resumeFile'), uploadResume);
router.get('/', getMyResumes);
router.get('/:id', getResume);
router.delete('/:id', deleteResume);

// ─── File Serving ─────────────────────────────────────────────────────────────
// GET /:id/file     → streams the file inline (for preview in browser/iframe)
// GET /:id/download → streams the file as attachment (triggers Save dialog)
router.get('/:id/file', serveResumeFile);
router.get('/:id/download', downloadResume);

export default router;
