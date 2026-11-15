import mongoose from 'mongoose';
import Account from '../../models/Account.js';
import { InvariantError, NotFoundError } from '../../exceptions/index.js';

const TYPE_MAPPING = {
  bank: 'bank',
  'e-wallet': 'e-wallet',
  ewallet: 'e-wallet',
  tunai: 'cash',
  cash: 'cash',
  investasi: 'investment',
  investment: 'investment',
  other: 'other',
  lainnya: 'other',
};

const ALLOWED_TYPES = ['bank', 'e-wallet', 'cash', 'investment', 'other'];

/**
 * Service to add/create a new account
 * @param {Object} payload
 * @param {string} payload.name
 * @param {string} [payload.type]
 * @param {number|string} [payload.initial_balance]
 * @param {string} [payload.color]
 * @param {string} [payload.icon]
 * @param {boolean} [payload.is_active]
 * @returns {Promise<Object>}
 */
const createAccount = async ({
  name,
  type = 'bank',
  initial_balance = 0,
  color = null,
  icon = 'landmark',
  is_active = true,
}) => {
  // 1. Validasi name
  if (!name || typeof name !== 'string' || name.trim() === '') {
    throw new InvariantError('Nama akun wajib diisi');
  }

  // 2. Normalisasi dan validasi type
  const rawType = String(type || 'bank').trim().toLowerCase();
  const normalizedType = TYPE_MAPPING[rawType];

  if (!normalizedType || !ALLOWED_TYPES.includes(normalizedType)) {
    throw new InvariantError(
      `Tipe akun '${type}' tidak valid. Pilihan yang tersedia: ${ALLOWED_TYPES.join(', ')}`
    );
  }

  // 3. Validasi initial_balance
  const parsedBalance =
    initial_balance !== undefined && initial_balance !== null && initial_balance !== ''
      ? Number(initial_balance)
      : 0;

  if (Number.isNaN(parsedBalance)) {
    throw new InvariantError('Saldo awal harus berupa angka yang valid');
  }

  // 4. Normalisasi color
  let formattedColor = null;
  if (color && typeof color === 'string' && color.trim() !== '') {
    const trimmedColor = color.trim();
    formattedColor = trimmedColor.startsWith('#')
      ? trimmedColor
      : /^[0-9A-Fa-f]{6}$/.test(trimmedColor)
      ? `#${trimmedColor}`
      : trimmedColor;
  }

  // 5. Normalisasi icon
  const normalizedIcon =
    icon && typeof icon === 'string' && icon.trim() !== '' ? icon.trim() : 'landmark';

  // 6. Normalisasi is_active
  const isActive = is_active !== undefined ? Boolean(is_active) : true;

  // 7. Simpan ke database
  const account = await Account.create({
    name: name.trim(),
    type: normalizedType,
    initial_balance: parsedBalance,
    color: formattedColor,
    icon: normalizedIcon,
    is_active: isActive,
  });

  return {
    id: account._id.toString(),
    name: account.name,
    type: account.type,
    icon: account.icon,
  };
};

/**
 * Service to get all accounts (all fields except timestamps)
 * @returns {Promise<Array<Object>>}
 */
const getAllAccounts = async () => {
  const accounts = await Account.find();
  return accounts.map((account) => ({
    id: account._id ? account._id.toString() : account.id,
    name: account.name,
    type: account.type,
    initial_balance: account.initial_balance,
    icon: account.icon,
    color: account.color,
    is_active: account.is_active,
  }));
};

/**
 * Service to update account by id
 * @param {string} id
 * @param {Object} payload
 * @param {string} [payload.name]
 * @param {string} [payload.type]
 * @param {number|string} [payload.initial_balance]
 * @param {string} [payload.color]
 * @param {string} [payload.icon]
 * @param {boolean} [payload.is_active]
 * @returns {Promise<Object>}
 */
const updateAccountById = async (id, {
  name,
  type,
  initial_balance,
  color,
  icon,
  is_active,
}) => {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new NotFoundError('Akun tidak ditemukan');
  }

  const updateData = {};

  // 1. Validasi name jika diberikan
  if (name !== undefined) {
    if (!name || typeof name !== 'string' || name.trim() === '') {
      throw new InvariantError('Nama akun wajib diisi');
    }
    updateData.name = name.trim();
  }

  // 2. Normalisasi dan validasi type jika diberikan
  if (type !== undefined) {
    const rawType = String(type).trim().toLowerCase();
    const normalizedType = TYPE_MAPPING[rawType];

    if (!normalizedType || !ALLOWED_TYPES.includes(normalizedType)) {
      throw new InvariantError(
        `Tipe akun '${type}' tidak valid. Pilihan yang tersedia: ${ALLOWED_TYPES.join(', ')}`
      );
    }
    updateData.type = normalizedType;
  }

  // 3. Validasi initial_balance jika diberikan
  if (initial_balance !== undefined && initial_balance !== null && initial_balance !== '') {
    const parsedBalance = Number(initial_balance);
    if (Number.isNaN(parsedBalance)) {
      throw new InvariantError('Saldo awal harus berupa angka yang valid');
    }
    updateData.initial_balance = parsedBalance;
  }

  // 4. Normalisasi color jika diberikan
  if (color !== undefined) {
    let formattedColor = null;
    if (color && typeof color === 'string' && color.trim() !== '') {
      const trimmedColor = color.trim();
      formattedColor = trimmedColor.startsWith('#')
        ? trimmedColor
        : /^[0-9A-Fa-f]{6}$/.test(trimmedColor)
        ? `#${trimmedColor}`
        : trimmedColor;
    }
    updateData.color = formattedColor;
  }

  // 5. Normalisasi icon jika diberikan
  if (icon !== undefined) {
    updateData.icon =
      icon && typeof icon === 'string' && icon.trim() !== '' ? icon.trim() : 'landmark';
  }

  // 6. Normalisasi is_active jika diberikan
  if (is_active !== undefined) {
    updateData.is_active = Boolean(is_active);
  }

  const updatedAccount = await Account.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  );

  if (!updatedAccount) {
    throw new NotFoundError('Akun tidak ditemukan');
  }

  return {
    name: updatedAccount.name,
    type: updatedAccount.type,
    icon: updatedAccount.icon,
  };
};

/**
 * Service to change account status by id (flexible: activate / deactivate / toggle)
 * @param {string} id
 * @param {boolean} [isActive]
 * @returns {Promise<Object>}
 */
const changeStatusAccountById = async (id, isActive) => {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new NotFoundError('Akun tidak ditemukan');
  }

  const currentAccount = await Account.findById(id);
  if (!currentAccount) {
    throw new NotFoundError('Akun tidak ditemukan');
  }

  const newStatus = isActive !== undefined ? Boolean(isActive) : !currentAccount.is_active;

  currentAccount.is_active = newStatus;
  await currentAccount.save();

  return {
    id: currentAccount._id.toString(),
    name: currentAccount.name,
    is_active: currentAccount.is_active,
  };
};

export {
  createAccount,
  getAllAccounts,
  updateAccountById,
  changeStatusAccountById,
};

