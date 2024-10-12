import express from 'express';
import { PsqlController } from '../controllers/psqlController';

const router = express.Router();
const psqlController = new PsqlController();

router.get('/:id', psqlController.getSession);
router.post('/', psqlController.addSession);

export default router;