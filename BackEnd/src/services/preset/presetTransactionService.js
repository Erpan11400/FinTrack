import mongoose from 'mongoose';
import PresetTransaction from '../../models/PresetTransaction.js';
import Account from '../../models/Account.js';
import Category from '../../models/Category.js';
import { InvariantError, NotFoundError } from '../../exceptions/index.js';
import { evaluateMathExpression } from '../../utils/math.js';

const TYPE_MAPPING = {
  income: 'income',
  pemasukan: 'income',
  expense: 'expense',
  pengeluaran: 'expense',
  transfer: 'transfer',
};

const ALLOWED_TYPES = ['income', 'expense', 'transfer'];

/**
 * Service to add a new preset transaction
 * @param {Object} payload
 * @param {string} payload.type
 * @param {string} payload.name
 * @param {string|number} payload.raw_expression
 * @param {string} payload.account_id
 * @param {string} [payload.destination_account_id]
 * @param {number|string} [payload.admin_fee]
 * @param {string} [payload.category_id]
 * @param {string} [payload.note]
 * @param {string} [payload.icon]
 * @returns {Promise<Object>}
 */
const createPresetTransaction = async ({
  type,
  name,
  raw_expression,
  account_id,
  destination_account_id = null,
  admin_fee = 0,
  category_id = null,
  note = '',
  icon = 'zap',
}) => {
  // 1. Validasi name
  if (!name || typeof name !== 'string' || name.trim() === '') {
    throw new InvariantError('Nama preset transaksi wajib diisi');
  }

  // 2. Normalisasi dan validasi type
  if (!type || typeof type !== 'string' || type.trim() === '') {
    throw new InvariantError('Tipe transaksi wajib diisi');
  }
  const rawType = String(type).trim().toLowerCase();
  const normalizedType = TYPE_MAPPING[rawType];

  if (!normalizedType || !ALLOWED_TYPES.includes(normalizedType)) {
    throw new InvariantError(
      `Tipe transaksi '${type}' tidak valid. Pilihan yang tersedia: ${ALLOWED_TYPES.join(', ')}`
    );
  }

  // 3. Evaluasi raw_expression menjadi amount
  const calculatedAmount = evaluateMathExpression(raw_expression);

  // 4. Validasi account_id
  if (!account_id || !mongoose.Types.ObjectId.isValid(account_id)) {
    throw new InvariantError('account_id tidak valid atau belum diisi');
  }
  const sourceAccount = await Account.findById(account_id);
  if (!sourceAccount) {
    throw new NotFoundError('Akun sumber tidak ditemukan');
  }

  // 5. Validasi destination_account_id jika tipe transfer
  let validDestinationAccountId = null;
  if (normalizedType === 'transfer') {
    if (!destination_account_id || !mongoose.Types.ObjectId.isValid(destination_account_id)) {
      throw new InvariantError('destination_account_id wajib diisi untuk tipe transfer');
    }
    if (String(account_id) === String(destination_account_id)) {
      throw new InvariantError('Akun asal dan akun tujuan tidak boleh sama');
    }
    const destinationAccount = await Account.findById(destination_account_id);
    if (!destinationAccount) {
      throw new NotFoundError('Akun tujuan transfer tidak ditemukan');
    }
    validDestinationAccountId = destinationAccount._id;
  }

  // 6. Validasi category_id jika bukan transfer
  let validCategoryId = null;
  if (normalizedType !== 'transfer' && category_id) {
    if (!mongoose.Types.ObjectId.isValid(category_id)) {
      throw new InvariantError('category_id tidak valid');
    }
    const category = await Category.findById(category_id);
    if (!category) {
      throw new NotFoundError('Kategori tidak ditemukan');
    }
    validCategoryId = category._id;
  }

  // 7. Normalisasi admin_fee
  const parsedAdminFee =
    admin_fee !== undefined && admin_fee !== null && admin_fee !== ''
      ? Number(admin_fee)
      : 0;

  if (Number.isNaN(parsedAdminFee) || parsedAdminFee < 0) {
    throw new InvariantError('admin_fee harus berupa angka lebih besar atau sama dengan 0');
  }

  // 8. Normalisasi note & icon
  const noteText = typeof note === 'string' ? note.trim() : '';
  const iconName = typeof icon === 'string' && icon.trim() !== '' ? icon.trim() : 'zap';

  // 9. Simpan ke database
  const preset = await PresetTransaction.create({
    name: name.trim(),
    type: normalizedType,
    amount: calculatedAmount,
    raw_expression: String(raw_expression).trim(),
    account_id: sourceAccount._id,
    destination_account_id: validDestinationAccountId,
    admin_fee: normalizedType === 'transfer' ? parsedAdminFee : 0,
    category_id: validCategoryId,
    note: noteText,
    icon: iconName,
  });

  return {
    id: preset._id.toString(),
    name: preset.name,
    type: preset.type
  };
};

/**
 * Service to get all preset transactions with populated names
 * @returns {Promise<Array<Object>>}
 */
const getAllPresetTransactions = async () => {
  const presets = await PresetTransaction.find()
    .populate('account_id', 'name')
    .populate('destination_account_id', 'name')
    .populate('category_id', 'name');

  return presets.map((preset) => ({
    id: preset._id.toString(),
    name: preset.name,
    type: preset.type,
    amount: preset.amount,
    account_name: preset.account_id?.name || null,
    destination_account_name: preset.destination_account_id?.name || null,
    admin_fee: preset.admin_fee ?? 0,
    category_name: preset.category_id?.name || null,
    note: preset.note || '',
    icon: preset.icon || '',
  }));
};

/**
 * Service to update preset transaction by id
 * @param {string} id
 * @param {Object} payload
 * @returns {Promise<Object>}
 */
const updatePresetTransaction = async (id, {
  type,
  name,
  raw_expression,
  account_id,
  destination_account_id,
  admin_fee,
  category_id,
  note,
  icon,
}) => {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new NotFoundError('Preset transaksi tidak ditemukan');
  }

  const existingPreset = await PresetTransaction.findById(id);
  if (!existingPreset) {
    throw new NotFoundError('Preset transaksi tidak ditemukan');
  }

  const updateData = {};

  // 1. Validasi name jika diberikan
  if (name !== undefined) {
    if (!name || typeof name !== 'string' || name.trim() === '') {
      throw new InvariantError('Nama preset transaksi wajib diisi');
    }
    updateData.name = name.trim();
  }

  // 2. Normalisasi dan validasi type jika diberikan
  let effectiveType = existingPreset.type;
  if (type !== undefined) {
    if (!type || typeof type !== 'string' || type.trim() === '') {
      throw new InvariantError('Tipe transaksi wajib diisi');
    }
    const rawType = String(type).trim().toLowerCase();
    const normalizedType = TYPE_MAPPING[rawType];
    if (!normalizedType || !ALLOWED_TYPES.includes(normalizedType)) {
      throw new InvariantError(
        `Tipe transaksi '${type}' tidak valid. Pilihan yang tersedia: ${ALLOWED_TYPES.join(', ')}`
      );
    }
    updateData.type = normalizedType;
    effectiveType = normalizedType;
  }

  // 3. Evaluasi raw_expression menjadi amount jika diberikan
  if (raw_expression !== undefined) {
    const calculatedAmount = evaluateMathExpression(raw_expression);
    updateData.raw_expression = String(raw_expression).trim();
    updateData.amount = calculatedAmount;
  }

  // 4. Validasi account_id jika diberikan
  let effectiveAccountId = existingPreset.account_id;
  if (account_id !== undefined) {
    if (!account_id || !mongoose.Types.ObjectId.isValid(account_id)) {
      throw new InvariantError('account_id tidak valid atau belum diisi');
    }
    const sourceAccount = await Account.findById(account_id);
    if (!sourceAccount) {
      throw new NotFoundError('Akun sumber tidak ditemukan');
    }
    updateData.account_id = sourceAccount._id;
    effectiveAccountId = sourceAccount._id;
  }

  // 5. Validasi destination_account_id
  if (effectiveType === 'transfer') {
    const targetDestId =
      destination_account_id !== undefined
        ? destination_account_id
        : existingPreset.destination_account_id;

    if (!targetDestId || !mongoose.Types.ObjectId.isValid(targetDestId)) {
      throw new InvariantError('destination_account_id wajib diisi untuk tipe transfer');
    }
    if (String(effectiveAccountId) === String(targetDestId)) {
      throw new InvariantError('Akun asal dan akun tujuan tidak boleh sama');
    }
    const destinationAccount = await Account.findById(targetDestId);
    if (!destinationAccount) {
      throw new NotFoundError('Akun tujuan transfer tidak ditemukan');
    }
    updateData.destination_account_id = destinationAccount._id;
  } else {
    updateData.destination_account_id = null;
  }

  // 6. Validasi category_id
  if (effectiveType === 'transfer') {
    updateData.category_id = null;
  } else if (category_id !== undefined) {
    if (category_id) {
      if (!mongoose.Types.ObjectId.isValid(category_id)) {
        throw new InvariantError('category_id tidak valid');
      }
      const category = await Category.findById(category_id);
      if (!category) {
        throw new NotFoundError('Kategori tidak ditemukan');
      }
      updateData.category_id = category._id;
    } else {
      updateData.category_id = null;
    }
  }

  // 7. Normalisasi admin_fee
  if (effectiveType === 'transfer') {
    if (admin_fee !== undefined) {
      const parsedAdminFee = Number(admin_fee);
      if (Number.isNaN(parsedAdminFee) || parsedAdminFee < 0) {
        throw new InvariantError('admin_fee harus berupa angka lebih besar atau sama dengan 0');
      }
      updateData.admin_fee = parsedAdminFee;
    }
  } else {
    updateData.admin_fee = 0;
  }

  // 8. Normalisasi note & icon
  if (note !== undefined) {
    updateData.note = typeof note === 'string' ? note.trim() : '';
  }
  if (icon !== undefined) {
    updateData.icon = typeof icon === 'string' && icon.trim() !== '' ? icon.trim() : 'zap';
  }

  const updatedPreset = await PresetTransaction.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  );

  return {
    name: updatedPreset.name,
    type: updatedPreset.type,
  };
};

/**
 * Service to get preset transaction by id
 * @param {string} id
 * @returns {Promise<Object>}
 */
const getPresetTransactionById = async (id) => {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new NotFoundError('Preset transaksi tidak ditemukan');
  }

  const preset = await PresetTransaction.findById(id);
  if (!preset) {
    throw new NotFoundError('Preset transaksi tidak ditemukan');
  }

  return preset;
};

/**
 * Service to delete preset transaction by id
 * @param {string} id
 * @returns {Promise<Object>}
 */
const deletePresetTransaction = async (id) => {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new NotFoundError('Preset transaksi tidak ditemukan');
  }

  const deletedPreset = await PresetTransaction.findByIdAndDelete(id);
  if (!deletedPreset) {
    throw new NotFoundError('Preset transaksi tidak ditemukan');
  }

  return deletedPreset.name;
};

export {
  evaluateMathExpression,
  createPresetTransaction,
  getAllPresetTransactions,
  getPresetTransactionById,
  updatePresetTransaction,
  deletePresetTransaction,
};

