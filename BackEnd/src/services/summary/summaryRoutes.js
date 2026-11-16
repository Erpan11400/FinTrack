import { Router } from 'express';
import {
  getSummaryHandler,
  getCashflowSummaryHandler,
  getAnalyticsSummaryHandler,
} from './summaryController.js';

const router = Router();

router.get('/', getSummaryHandler);
router.get('/cashflow', getCashflowSummaryHandler);
router.get('/analytics', getAnalyticsSummaryHandler);

export default router;
