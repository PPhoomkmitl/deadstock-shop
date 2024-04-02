const express = require('express');
const {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategory,
  getAllCategory,
  getProductByCategory
} = require('../controller/productCategoryController');
const authAccess = require('../middleware/authAccess')
const isAdmin = require('../middleware/isAdmin')
const sanitizeMiddleware = require('../middleware/sanitizeMiddleware')
const router = express.Router();

// router.post('/create-category',sanitizeMiddleware, authAccess, isAdmin ,createCategory);
router.post('/create-category',createCategory); // เอามาแค่แก้ไข

router.put('/update-category/:id', authAccess, isAdmin, updateCategory);
router.delete('/delete-category/:id',authAccess, isAdmin,  deleteCategory);

router.get('/get-category/:name', getCategory);
router.get('/get-product-category', sanitizeMiddleware ,getProductByCategory);
router.get('/get-all/' ,getAllCategory);

module.exports = router;