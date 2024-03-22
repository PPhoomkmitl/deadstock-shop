const express = require('express');
const {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategory,
  getallCategory,
  getProductByCategory
} = require('../controller/productCategoryController');
const authAccess = require('../middleware/authAccess')
const isAdmin = require('../middleware/isAdmin')
const router = express.Router();

router.post('/create-category', createCategory);
router.put('/update-category/:id', updateCategory);
router.delete('/delete-category/:id', deleteCategory);

router.get('/get-category/:name', getCategory);
router.get('/get-product-category/:name', getProductByCategory);
router.get('/get-all/' ,getallCategory);

module.exports = router;