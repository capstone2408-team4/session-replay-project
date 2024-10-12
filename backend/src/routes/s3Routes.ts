import express from 'express';
import { S3Controller } from '../controllers/s3Controller';

const router = express.Router();
const s3Controller = new S3Controller();

router.get('/:id', s3Controller.getFile);
router.post('/', s3Controller.addFile);

export default router;