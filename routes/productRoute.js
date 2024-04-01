const express = require("express");
const {
  createProduct,
  getProduct,
  getAllProduct,
  updateProduct,
  deleteProduct,
  getSearchProduct,
  updateStockProduct
} = require("../controller/productController");
const authAccess = require('../middleware/authAccess')
const authRefresh = require('../middleware/authRefresh')
const isAdmin = require('../middleware/isAdmin')
const router = express.Router();

router.get('/get-id/:id', getProduct);
router.get('/get-all', getAllProduct);

// router.get('/get-search', getSearchProduct);
router.post('/create', authAccess ,createProduct);
router.put('/update/:id', authAccess ,updateProduct);
router.put('/update-stock/:id', authAccess , updateStockProduct);
router.delete('/delete/:id',authAccess, deleteProduct);
router.get('/search',getSearchProduct);


module.exports = router;