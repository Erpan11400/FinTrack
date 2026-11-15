import {
  updatePassword,
  updateAutoLock,
} from './systemSettingService.js';
import response from '../../utils/response.js';

const updatePasswordHandler = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    await updatePassword({ currentPassword, newPassword });

    return response(res, 200, 'Master password berhasil diperbarui');
  } catch (error) {
    next(error);
  }
};

const updateAutoLockHandler = async (req, res, next) => {
  try {
    const { auto_lock_timeout_minutes } = req.body;

    const result = await updateAutoLock({ auto_lock_timeout_minutes });

    return response(res, 200, `Durasi auto-lock berhasil diperbarui menjadi ${result} menit`);
  } catch (error) {
    next(error);
  }
};

export {
  updatePasswordHandler,
  updateAutoLockHandler,
};

