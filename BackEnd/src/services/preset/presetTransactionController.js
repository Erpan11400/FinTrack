import {
  createPresetTransaction,
  getAllPresetTransactions,
  updatePresetTransaction,
  deletePresetTransaction,
} from './presetTransactionService.js';
import response from '../../utils/response.js';

const createPresetTransactionHandler = async (req, res, next) => {
  try {
    const {
      type,
      name,
      raw_expression,
      account_id,
      destination_account_id,
      admin_fee,
      category_id,
      note,
      icon,
    } = req.body;

    const newPreset = await createPresetTransaction({
      type,
      name,
      raw_expression,
      account_id,
      destination_account_id,
      admin_fee,
      category_id,
      note,
      icon,
    });

    return response(res, 201, 'Preset transaksi berhasil ditambahkan', newPreset);
  } catch (error) {
    next(error);
  }
};

const getAllPresetTransactionsHandler = async (_, res, next) => {
  try {
    const presets = await getAllPresetTransactions();

    return response(res, 200, 'Berhasil mendapatkan data preset transaksi', presets);
  } catch (error) {
    next(error);
  }
};

const updatePresetTransactionHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      type,
      name,
      raw_expression,
      account_id,
      destination_account_id,
      admin_fee,
      category_id,
      note,
      icon,
    } = req.body;

    const updatedPreset = await updatePresetTransaction(id, {
      type,
      name,
      raw_expression,
      account_id,
      destination_account_id,
      admin_fee,
      category_id,
      note,
      icon,
    });

    return response(res, 200, 'Preset transaksi berhasil diperbarui', updatedPreset);
  } catch (error) {
    next(error);
  }
};

const deletePresetTransactionHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedPreset = await deletePresetTransaction(id);

    return response(res, 200, `Preset transaksi ${deletedPreset} berhasil dihapus`);
  } catch (error) {
    next(error);
  }
};

export {
  createPresetTransactionHandler,
  getAllPresetTransactionsHandler,
  updatePresetTransactionHandler,
  deletePresetTransactionHandler,
};

