import { Router } from 'express';
import {
  createAccountHandler,
  getAllAccountHandler,
  updateAccountByIdHandler,
  changeStatusAccountHandler,
} from './accountController.js';

const router = Router();

router.get('/', getAllAccountHandler);
router.post('/', createAccountHandler);
router.put('/:id', updateAccountByIdHandler);
router.patch('/:id', changeStatusAccountHandler);

export default router;
