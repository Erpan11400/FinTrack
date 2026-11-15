import { Router } from 'express';
import {
  createPresetTransactionHandler,
  getAllPresetTransactionsHandler,
  updatePresetTransactionHandler,
  deletePresetTransactionHandler,
} from './presetTransactionController.js';

const router = Router();

router.get('/', getAllPresetTransactionsHandler);
router.post('/', createPresetTransactionHandler);
router.put('/:id', updatePresetTransactionHandler);
router.delete('/:id', deletePresetTransactionHandler);

export default router;
