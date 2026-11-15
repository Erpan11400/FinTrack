import {
  createAccount,
  getAllAccounts,
  updateAccountById,
  changeStatusAccountById,
} from './accountService.js';
import response from '../../utils/response.js';

const createAccountHandler = async (req, res, next) => {
  try {
    const { name, type, initial_balance, color, icon, is_active } = req.body;

    const newAccount = await createAccount({
      name,
      type,
      initial_balance,
      color,
      icon,
      is_active,
    });

    return response(res, 201, `Akun ${newAccount.name} berhasil ditambahkan`, newAccount);
  } catch (error) {
    next(error);
  }
};

const getAllAccountHandler = async (_, res, next) => {
  try {
    const accounts = await getAllAccounts();

    return response(res, 200, 'Berhasil mendapatkan data akun', accounts);
  } catch (error) {
    next(error);
  }
};

const updateAccountByIdHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, type, initial_balance, color, icon, is_active } = req.body;

    const updatedAccount = await updateAccountById(id, {
      name,
      type,
      initial_balance,
      color,
      icon,
      is_active,
    });

    return response(res, 200, 'Akun berhasil diperbarui', updatedAccount);
  } catch (error) {
    next(error);
  }
};

const changeStatusAccountHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    const account = await changeStatusAccountById(id, is_active);
    const action = account.is_active ? 'diaktifkan' : 'dinonaktifkan';

    return response(res, 200, `Akun ${account.name} berhasil ${action}`, account);
  } catch (error) {
    next(error);
  }
};

export {
  createAccountHandler,
  getAllAccountHandler,
  updateAccountByIdHandler,
  changeStatusAccountHandler,
};

