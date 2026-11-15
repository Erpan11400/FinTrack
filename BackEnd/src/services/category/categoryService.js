import mongoose from 'mongoose';
import Category from '../../models/Category.js';
import { InvariantError, NotFoundError } from '../../exceptions/index.js';

const TYPE_MAPPING = {
  income: 'income',
  pemasukan: 'income',
  expense: 'expense',
  pengeluaran: 'expense',
};

const ALLOWED_TYPES = ['income', 'expense'];

/**
 * Service to add/create a new category
 * @param {Object} payload
 * @param {string} payload.name
 * @param {string} payload.type
 * @param {string} [payload.color]
 * @param {boolean} [payload.is_active]
 * @returns {Promise<Object>}
 */
const createCategory = async ({
  name,
  type,
  color = null,
  is_active = true,
}) => {
  // 1. Validasi name
  if (!name || typeof name !== 'string' || name.trim() === '') {
    throw new InvariantError('Nama kategori wajib diisi');
  }

  // 2. Normalisasi dan validasi type
  if (!type || typeof type !== 'string' || type.trim() === '') {
    throw new InvariantError('Tipe kategori wajib diisi');
  }

  const rawType = String(type).trim().toLowerCase();
  const normalizedType = TYPE_MAPPING[rawType];

  if (!normalizedType || !ALLOWED_TYPES.includes(normalizedType)) {
    throw new InvariantError(
      `Tipe kategori '${type}' tidak valid. Pilihan yang tersedia: income, expense`
    );
  }

  // 3. Normalisasi color
  let formattedColor = null;
  if (color && typeof color === 'string' && color.trim() !== '') {
    const trimmedColor = color.trim();
    formattedColor = trimmedColor.startsWith('#')
      ? trimmedColor
      : /^[0-9A-Fa-f]{6}$/.test(trimmedColor)
      ? `#${trimmedColor}`
      : trimmedColor;
  }

  // 4. Normalisasi is_active
  const isActive = is_active !== undefined ? Boolean(is_active) : true;

  // 5. Simpan ke database
  const category = await Category.create({
    name: name.trim(),
    type: normalizedType,
    color: formattedColor,
    is_active: isActive,
  });

  return {
    id: category._id.toString(),
    name: category.name
  };
};

/**
 * Service to get all categories (without timestamps)
 * @returns {Promise<Array<Object>>}
 */
const getAllCategories = async () => {
  const categories = await Category.find();
  return categories.map((cat) => ({
    id: cat._id.toString(),
    name: cat.name,
    type: cat.type,
    color: cat.color,
    is_active: cat.is_active,
  }));
};

/**
 * Service to update category by id
 * @param {string} id
 * @param {Object} payload
 * @param {string} [payload.name]
 * @param {string} [payload.type]
 * @param {string} [payload.color]
 * @param {boolean} [payload.is_active]
 * @returns {Promise<Object>}
 */
const updateCategoryById = async (id, {
  name,
  type,
  color,
  is_active,
}) => {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new NotFoundError('Kategori tidak ditemukan');
  }

  const updateData = {};

  // 1. Validasi name jika diberikan
  if (name !== undefined) {
    if (!name || typeof name !== 'string' || name.trim() === '') {
      throw new InvariantError('Nama kategori wajib diisi');
    }
    updateData.name = name.trim();
  }

  // 2. Normalisasi dan validasi type jika diberikan
  if (type !== undefined) {
    if (!type || typeof type !== 'string' || type.trim() === '') {
      throw new InvariantError('Tipe kategori wajib diisi');
    }
    const rawType = String(type).trim().toLowerCase();
    const normalizedType = TYPE_MAPPING[rawType];

    if (!normalizedType || !ALLOWED_TYPES.includes(normalizedType)) {
      throw new InvariantError(
        `Tipe kategori '${type}' tidak valid. Pilihan yang tersedia: income, expense`
      );
    }
    updateData.type = normalizedType;
  }

  // 3. Normalisasi color jika diberikan
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

  // 4. Normalisasi is_active jika diberikan
  if (is_active !== undefined) {
    updateData.is_active = Boolean(is_active);
  }

  const updatedCategory = await Category.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  );

  if (!updatedCategory) {
    throw new NotFoundError('Kategori tidak ditemukan');
  }

  return updatedCategory.name;
};

/**
 * Service to change category status by id (flexible: activate / deactivate / toggle)
 * @param {string} id
 * @param {boolean} [isActive]
 * @returns {Promise<Object>}
 */
const changeStatusCategoryById = async (id, isActive) => {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new NotFoundError('Kategori tidak ditemukan');
  }

  const currentCategory = await Category.findById(id);
  if (!currentCategory) {
    throw new NotFoundError('Kategori tidak ditemukan');
  }

  const newStatus = isActive !== undefined ? Boolean(isActive) : !currentCategory.is_active;

  currentCategory.is_active = newStatus;
  await currentCategory.save();

  return {
    id: currentCategory._id.toString(),
    name: currentCategory.name,
    is_active: currentCategory.is_active,
  };
};

export {
  createCategory,
  getAllCategories,
  updateCategoryById,
  changeStatusCategoryById,
};

