import { Router } from 'express';
import {
  updatePasswordHandler,
  updateAutoLockHandler,
} from './systemSettingController.js';

const router = Router();

router.put('/password', updatePasswordHandler);
router.patch('/auto-lock', updateAutoLockHandler);

export default router;
