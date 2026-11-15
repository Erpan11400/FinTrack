import {
  createCategory,
  getAllCategories,
  updateCategoryById,
  changeStatusCategoryById,
} from './categoryService.js';
import response from '../../utils/response.js';

const createCategoryHandler = async (req, res, next) => {
  try {
    const { type, name, color, is_active } = req.body;

    const newCategory = await createCategory({
      type,
      name,
      color,
      is_active,
    });

    return response(res, 201, `Kategori ${newCategory.name} berhasil ditambahkan`, newCategory);
  } catch (error) {
    next(error);
  }
};

const getAllCategoriesHandler = async (_, res, next) => {
  try {
    const categories = await getAllCategories();

    return response(res, 200, 'Berhasil mendapatkan data kategori', categories);
  } catch (error) {
    next(error);
  }
};

const updateCategoryHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, type, color, is_active } = req.body;

    const updatedCategory = await updateCategoryById(id, {
      name,
      type,
      color,
      is_active,
    });

    return response(res, 200, `Kategori ${updatedCategory} berhasil diperbarui`);
  } catch (error) {
    next(error);
  }
};

const changeStatusCategoryHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    const category = await changeStatusCategoryById(id, is_active);
    const action = category.is_active ? 'diaktifkan' : 'dinonaktifkan';

    return response(res, 200, `Kategori ${category.name} berhasil ${action}`, category);
  } catch (error) {
    next(error);
  }
};

export {
  createCategoryHandler,
  getAllCategoriesHandler,
  updateCategoryHandler,
  changeStatusCategoryHandler,
};

