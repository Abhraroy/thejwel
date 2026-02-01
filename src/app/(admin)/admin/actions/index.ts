/**
 * Admin Actions Index
 * 
 * Central export point for all admin actions.
 * Import from this file for cleaner imports in components.
 */

// Category actions
export {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  type Category,
  type CreateCategoryData,
  type UpdateCategoryData,
} from './categories'

// Utility functions
export { extractR2KeyFromUrl } from './utils'

