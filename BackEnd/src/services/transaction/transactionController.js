import {
  createTransaction,
  createTransactionFromPreset,
  getTransactionsByAccountId,
  updateTransactionById,
  deleteTransactionById,
} from './transactionService.js';
import response from '../../utils/response.js';

const createTransactionHandler = async (req, res, next) => {
  try {
    const {
      type,
      raw_expression,
      account_id,
      destination_account_id,
      admin_fee,
      category_id,
      note,
      date,
      save_as_preset,
    } = req.body;

    const newTransaction = await createTransaction({
      type,
      raw_expression,
      account_id,
      destination_account_id,
      admin_fee,
      category_id,
      note,
      date,
      save_as_preset,
    });

    return response(res, 201, 'Transaksi berhasil ditambahkan', newTransaction);
  } catch (error) {
    next(error);
  }
};

const createTransactionFromPresetHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const newTransaction = await createTransactionFromPreset(id);

    return response(res, 201, 'Transaksi dari preset berhasil ditambahkan', newTransaction);
  } catch (error) {
    next(error);
  }
};

const updateTransactionHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      type,
      raw_expression,
      account_id,
      destination_account_id,
      admin_fee,
      category_id,
      note,
      date,
    } = req.body;

    const updatedTransaction = await updateTransactionById(id, {
      type,
      raw_expression,
      account_id,
      destination_account_id,
      admin_fee,
      category_id,
      note,
      date,
    });

    return response(res, 200, 'Transaksi berhasil diperbarui', updatedTransaction);
  } catch (error) {
    next(error);
  }
};

const deleteTransactionHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    await deleteTransactionById(id);

    return response(res, 200, 'Transaksi berhasil dihapus');
  } catch (error) {
    next(error);
  }
};

const getTransactionByAccountIdHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await getTransactionsByAccountId(id);

    return response(res, 200, 'Berhasil mendapatkan data transaksi akun', data);
  } catch (error) {
    next(error);
  }
};

export {
  createTransactionHandler,
  createTransactionFromPresetHandler,
  updateTransactionHandler,
  deleteTransactionHandler,
  getTransactionByAccountIdHandler,
};

