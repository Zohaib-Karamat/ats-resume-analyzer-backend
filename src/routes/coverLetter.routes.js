import { Router } from 'express';
import { generate, getAll, getOne, downloadPdf, remove } from '../controllers/coverLetter.controller.js';
import { verifyJWT } from '../middleware/auth.middleware.js';

const router = Router();

router.use(verifyJWT);

router.post('/generate', generate);
router.get('/', getAll);
router.get('/:id', getOne);
router.get('/:id/pdf', downloadPdf);
router.delete('/:id', remove);

export default router;
