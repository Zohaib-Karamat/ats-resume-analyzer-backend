import { Router } from 'express';
import { verifyJWT } from '../middleware/auth.middleware.js';
import {
  runAnalysis,
  getAnalyses,
  getAnalysisById,
  deleteAnalysis
} from '../controllers/analysis.controller.js';

const router = Router();

router.use(verifyJWT);

router.post('/', runAnalysis);
router.get('/', getAnalyses);
router.get('/:id', getAnalysisById);
router.delete('/:id', deleteAnalysis);

export default router;
