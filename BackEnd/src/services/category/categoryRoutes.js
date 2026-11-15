import { Router } from 'express';
import {
  createCategoryHandler,
  getAllCategoriesHandler,
  updateCategoryHandler,
  changeStatusCategoryHandler,
} from './categoryController.js';

const router = Router();

router.get('/', getAllCategoriesHandler);
router.post('/', createCategoryHandler);
router.put('/:id', updateCategoryHandler);
router.patch('/:id', changeStatusCategoryHandler);

export default router;
