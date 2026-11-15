import bcrypt from 'bcrypt';
import SystemSetting from '../../models/SystemSetting.js';
import { InvariantError } from '../../exceptions/index.js';

const SALT_ROUNDS = 10;
// Default bcrypt hash for 'admin123'
const DEFAULT_BCRYPT_HASH = '$2b$10$So/4xDzt/nTpH2jVR88UK.S2bT/UtmrwG42BbrtBxDAzXRnnY/CZy';

/**
 * Hash password string with bcrypt
 * @param {string} password
 * @returns {Promise<string>}
 */
const hashPassword = async (password) => {
  return bcrypt.hash(String(password), SALT_ROUNDS);
};

/**
 * Get existing setting or create default
 * @returns {Promise<Object>}
 */
const getOrCreateSetting = async () => {
  let setting = await SystemSetting.findOne();
  if (!setting) {
    setting = await SystemSetting.create({
      master_password_hash: DEFAULT_BCRYPT_HASH,
      auto_lock_timeout_minutes: 15,
    });
  }
  return setting;
};

/**
 * Verify input password against stored hash with bcrypt
 * @param {string} inputPassword
 * @param {string} storedHash
 * @returns {Promise<boolean>}
 */
const verifyPassword = async (inputPassword, storedHash) => {
  if (!storedHash) return false;

  // Cek apakah format hash adalah bcrypt ($2a$, $2b$, dsb.)
  if (storedHash.startsWith('$2')) {
    return bcrypt.compare(String(inputPassword), storedHash);
  }

  // Fallback kompatibilitas demo awal jika sebelumnya ada hash lama
  if (inputPassword === 'admin123') {
    return true;
  }

  return false;
};

/**
 * Service to update master password
 * @param {Object} payload
 * @param {string} payload.currentPassword
 * @param {string} payload.newPassword
 * @returns {Promise<boolean>}
 */
const updatePassword = async ({ currentPassword, newPassword }) => {
  if (!currentPassword || typeof currentPassword !== 'string') {
    throw new InvariantError('Password saat ini wajib diisi');
  }

  if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 4) {
    throw new InvariantError('Password baru wajib diisi dan minimal 4 karakter');
  }

  const setting = await getOrCreateSetting();

  const isValid = await verifyPassword(currentPassword, setting.master_password_hash);
  if (!isValid) {
    throw new InvariantError('Password saat ini salah');
  }

  const newHash = await hashPassword(newPassword);
  setting.master_password_hash = newHash;
  await setting.save();

  return true;
};

/**
 * Service to update auto-lock timeout
 * @param {Object} payload
 * @param {number|string} payload.auto_lock_timeout_minutes
 * @returns {Promise<Object>}
 */
const updateAutoLock = async ({ auto_lock_timeout_minutes }) => {
  if (
    auto_lock_timeout_minutes === undefined ||
    auto_lock_timeout_minutes === null ||
    auto_lock_timeout_minutes === ''
  ) {
    throw new InvariantError('Durasi auto-lock wajib diisi');
  }

  const parsedMinutes = Number(auto_lock_timeout_minutes);
  if (Number.isNaN(parsedMinutes) || parsedMinutes < 0) {
    throw new InvariantError('Durasi auto-lock harus berupa angka lebih besar atau sama dengan 0');
  }

  const setting = await getOrCreateSetting();
  setting.auto_lock_timeout_minutes = parsedMinutes;
  await setting.save();

  return setting.auto_lock_timeout_minutes;
};

export {
  hashPassword,
  verifyPassword,
  getOrCreateSetting,
  updatePassword,
  updateAutoLock,
};
