import { Router } from 'express';
import { uploadResume, getMyResumes, getResume, deleteResume } from '../controllers/resume.controller.js';
import { verifyJWT } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = Router();

// All resume routes require authentication
router.use(verifyJWT);

router.post('/upload', upload.single('resumeFile'), uploadResume);
router.get('/', getMyResumes);
router.get('/:id', getResume);
router.delete('/:id', deleteResume);

export default router;
