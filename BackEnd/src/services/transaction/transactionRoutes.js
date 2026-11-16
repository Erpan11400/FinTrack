import { Router } from 'express';
import {
  createTransactionHandler,
  getAllTransactionHandler,
  createTransactionFromPresetHandler,
  updateTransactionHandler,
  deleteTransactionHandler,
  getTransactionByAccountIdHandler,
} from './transactionController.js';

const router = Router();

router.get('/', getAllTransactionHandler)
router.get('/account/:id', getTransactionByAccountIdHandler);
router.post('/', createTransactionHandler);
router.post('/preset/:id', createTransactionFromPresetHandler);
router.put('/:id', updateTransactionHandler);
router.delete('/:id', deleteTransactionHandler);

export default router;
