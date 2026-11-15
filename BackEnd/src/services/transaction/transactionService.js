import mongoose from 'mongoose';
import Transaction from '../../models/Transaction.js';
import PresetTransaction from '../../models/PresetTransaction.js';
import Account from '../../models/Account.js';
import Category from '../../models/Category.js';
import { InvariantError, NotFoundError } from '../../exceptions/index.js';
import { evaluateMathExpression } from '../../utils/math.js';
import { getPresetTransactionById } from '../preset/presetTransactionService.js';

const TYPE_MAPPING = {
  income: 'income',
  pemasukan: 'income',
  expense: 'expense',
  pengeluaran: 'expense',
  transfer: 'transfer',
};

const ALLOWED_TYPES = ['income', 'expense', 'transfer'];

/**
 * Service to add/create a new transaction
 * @param {Object} payload
 * @param {string} payload.type
 * @param {string|number} payload.raw_expression
 * @param {string} payload.account_id
 * @param {string} [payload.destination_account_id]
 * @param {number|string} [payload.admin_fee]
 * @param {string} [payload.category_id]
 * @param {string} [payload.note]
 * @param {string|Date} [payload.date]
 * @param {boolean} [payload.save_as_preset]
 * @returns {Promise<Object>}
 */
const createTransaction = async ({
  type,
  raw_expression,
  account_id,
  destination_account_id = null,
  admin_fee = 0,
  category_id = null,
  note = '',
  date,
  save_as_preset = false,
}) => {
  // 1. Normalisasi dan validasi type
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

  // 2. Evaluasi raw_expression menjadi amount
  const calculatedAmount = evaluateMathExpression(raw_expression);

  // 3. Validasi account_id
  if (!account_id || !mongoose.Types.ObjectId.isValid(account_id)) {
    throw new InvariantError('account_id tidak valid atau belum diisi');
  }
  const sourceAccount = await Account.findById(account_id);
  if (!sourceAccount) {
    throw new NotFoundError('Akun sumber tidak ditemukan');
  }

  // 4. Validasi destination_account_id jika tipe transfer
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

  // 5. Validasi category_id jika bukan transfer
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

  // 6. Normalisasi admin_fee
  const parsedAdminFee =
    admin_fee !== undefined && admin_fee !== null && admin_fee !== ''
      ? Number(admin_fee)
      : 0;

  if (Number.isNaN(parsedAdminFee) || parsedAdminFee < 0) {
    throw new InvariantError('admin_fee harus berupa angka lebih besar atau sama dengan 0');
  }

  // 7. Normalisasi note
  const noteText = typeof note === 'string' ? note.trim() : '';

  // 8. Normalisasi date
  let transactionDate = new Date();
  if (date !== undefined && date !== null && date !== '') {
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
      throw new InvariantError('Format tanggal (date) tidak valid');
    }
    transactionDate = parsedDate;
  }

  // 9. Simpan ke database
  const transaction = await Transaction.create({
    type: normalizedType,
    amount: calculatedAmount,
    raw_expression: String(raw_expression).trim(),
    account_id: sourceAccount._id,
    destination_account_id: validDestinationAccountId,
    admin_fee: normalizedType === 'transfer' ? parsedAdminFee : 0,
    category_id: validCategoryId,
    note: noteText,
    date: transactionDate,
  });

  // 10. Simpan sebagai preset jika save_as_preset bernilai true
  if (Boolean(save_as_preset)) {
    await PresetTransaction.create({
      name: 'Preset Transaksi Baru',
      type: normalizedType,
      amount: calculatedAmount,
      raw_expression: String(raw_expression).trim(),
      account_id: sourceAccount._id,
      destination_account_id: validDestinationAccountId,
      admin_fee: normalizedType === 'transfer' ? parsedAdminFee : 0,
      category_id: validCategoryId,
      note: noteText,
      icon: 'zap',
    });
  }

  return { id: transaction._id.toString() };
};

/**
 * Service to get transactions by account id with running balance & summary
 * @param {string} accountId
 * @returns {Promise<Object>}
 */
const getTransactionsByAccountId = async (accountId) => {
  if (!accountId || !mongoose.Types.ObjectId.isValid(accountId)) {
    throw new InvariantError('ID akun tidak valid');
  }

  const account = await Account.findById(accountId);
  if (!account) {
    throw new NotFoundError('Akun tidak ditemukan');
  }

  const rawTransactions = await Transaction.find({
    $or: [
      { account_id: account._id },
      { destination_account_id: account._id },
    ],
  }).populate('category_id', 'name');

  const formatDateToDateString = (dateVal) => {
    if (!dateVal) return '';
    if (typeof dateVal === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateVal)) {
      return dateVal.slice(0, 10);
    }
    const d = new Date(dateVal);
    if (Number.isNaN(d.getTime())) return '';
    return d.toISOString().slice(0, 10);
  };

  const getCreatedAtTimestamp = (doc) => {
    if (doc.createdAt) {
      const t = new Date(doc.createdAt).getTime();
      if (!Number.isNaN(t)) return t;
    }
    if (doc._id && typeof doc._id.getTimestamp === 'function') {
      return doc._id.getTimestamp().getTime();
    }
    return 0;
  };

  // Urutkan transaksi secara kronologis (asc) untuk penghitungan running balance
  rawTransactions.sort((a, b) => {
    const dateA = formatDateToDateString(a.date);
    const dateB = formatDateToDateString(b.date);

    if (dateA !== dateB) {
      return dateA.localeCompare(dateB);
    }

    return getCreatedAtTimestamp(a) - getCreatedAtTimestamp(b);
  });

  const initialBalance = account.initial_balance || 0;
  let runningBalance = initialBalance;
  let totalIn = 0;
  let totalOut = 0;

  const chronologicalList = [];

  for (const t of rawTransactions) {
    let amountIn = 0;
    let amountOut = 0;
    let fee = 0;

    const isSource = String(t.account_id) === String(account._id);

    if (t.type === 'income') {
      amountIn = t.amount;
    } else if (t.type === 'expense') {
      amountOut = t.amount;
    } else if (t.type === 'transfer') {
      if (isSource) {
        fee = t.admin_fee || 0;
        amountOut = t.amount + fee;
      } else {
        amountIn = t.amount;
      }
    }

    runningBalance += amountIn - amountOut;
    totalIn += amountIn;
    totalOut += amountOut;

    let categoryObj = null;
    if (t.category_id && typeof t.category_id === 'object') {
      categoryObj = {
        id: t.category_id._id ? t.category_id._id.toString() : String(t.category_id),
        name: t.category_id.name || '',
      };
    }

    const dateStr = formatDateToDateString(t.date);

    chronologicalList.push({
      id: t._id.toString(),
      date: dateStr,
      description: t.note || '',
      type: t.type,
      category: categoryObj,
      amount_in: amountIn,
      amount_out: amountOut,
      fee,
      running_balance: runningBalance,
      _createdAtTimestamp: getCreatedAtTimestamp(t),
    });
  }

  // Urutkan dari terbaru ke terlama (desc):
  // 1. Berdasarkan tanggal date (desc)
  // 2. Bila date sama, urutkan berdasarkan createdAt (desc)
  const transactions = chronologicalList
    .sort((a, b) => {
      if (a.date !== b.date) {
        return b.date.localeCompare(a.date);
      }
      return b._createdAtTimestamp - a._createdAtTimestamp;
    })
    .map(({ _createdAtTimestamp, ...tx }) => tx);

  return {
    account: {
      id: account._id.toString(),
      name: account.name,
      type: account.type,
    },
    summary: {
      initial_balance: initialBalance,
      total_in: totalIn,
      total_out: totalOut,
      current_balance: runningBalance,
    },
    transactions,
  };
};

/**
 * Service to create transaction from a preset
 * @param {string} presetId
 * @returns {Promise<Object>}
 */
const createTransactionFromPreset = async (presetId) => {
  const preset = await getPresetTransactionById(presetId);

  return await createTransaction({
    type: preset.type,
    raw_expression: preset.raw_expression || preset.amount,
    account_id: preset.account_id,
    destination_account_id: preset.destination_account_id,
    admin_fee: preset.admin_fee,
    category_id: preset.category_id,
    note: preset.note,
    date: new Date(),
    save_as_preset: false,
  });
};

/**
 * Service to update an existing transaction by id
 * @param {string} id
 * @param {Object} payload
 * @param {string} payload.type
 * @param {string|number} payload.raw_expression
 * @param {string} payload.account_id
 * @param {string} [payload.destination_account_id]
 * @param {number|string} [payload.admin_fee]
 * @param {string} [payload.category_id]
 * @param {string} [payload.note]
 * @param {string|Date} [payload.date]
 * @returns {Promise<Object>}
 */
const updateTransactionById = async (id, {
  type,
  raw_expression,
  account_id,
  destination_account_id = null,
  admin_fee = 0,
  category_id = null,
  note = '',
  date,
}) => {
  // 1. Validasi ID transaksi
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new NotFoundError('Transaksi tidak ditemukan');
  }

  const existingTransaction = await Transaction.findById(id);
  if (!existingTransaction) {
    throw new NotFoundError('Transaksi tidak ditemukan');
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

  // 8. Normalisasi note
  const noteText = typeof note === 'string' ? note.trim() : '';

  // 9. Normalisasi date
  let transactionDate = existingTransaction.date;
  if (date !== undefined && date !== null && date !== '') {
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
      throw new InvariantError('Format tanggal (date) tidak valid');
    }
    transactionDate = parsedDate;
  }

  const updatedTransaction = await Transaction.findByIdAndUpdate(
    id,
    {
      type: normalizedType,
      amount: calculatedAmount,
      raw_expression: String(raw_expression).trim(),
      account_id: sourceAccount._id,
      destination_account_id: validDestinationAccountId,
      admin_fee: normalizedType === 'transfer' ? parsedAdminFee : 0,
      category_id: validCategoryId,
      note: noteText,
      date: transactionDate,
    },
    { new: true, runValidators: true }
  );

  return { id: updatedTransaction._id.toString() };
};

/**
 * Service to delete transaction by id
 * @param {string} id
 * @returns {Promise<Object>}
 */
const deleteTransactionById = async (id) => {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new NotFoundError('Transaksi tidak ditemukan');
  }

  const deletedTransaction = await Transaction.findByIdAndDelete(id);
  if (!deletedTransaction) {
    throw new NotFoundError('Transaksi tidak ditemukan');
  }

  return { id: deletedTransaction._id.toString() };
};

export {
  createTransaction,
  createTransactionFromPreset,
  getTransactionsByAccountId,
  updateTransactionById,
  deleteTransactionById,
};

