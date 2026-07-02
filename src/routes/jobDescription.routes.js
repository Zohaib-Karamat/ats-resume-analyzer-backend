import { Router } from 'express';
import { verifyJWT } from '../middleware/auth.middleware.js';
import {
  createJobDescription,
  getJobDescriptions,
  getJobDescriptionById,
  updateJobDescription,
  deleteJobDescription
} from '../controllers/jobDescription.controller.js';

const router = Router();

// Require JWT for all job description routes
router.use(verifyJWT);

router.post('/', createJobDescription);
router.get('/', getJobDescriptions);
router.get('/:id', getJobDescriptionById);
router.patch('/:id', updateJobDescription);
router.delete('/:id', deleteJobDescription);

export default router;
