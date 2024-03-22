const express = require("express");
const {
  createProduct,
  getProduct,
  getAllProduct,
  updateProduct,
  deleteProduct,
  getSearchProduct
} = require("../controller/productController");
const authAccess = require('../middleware/authAccess')
const authRefresh = require('../middleware/authRefresh')
const isAdmin = require('../middleware/isAdmin')
const router = express.Router();

router.get('/get/:id', getProduct);
router.get('/get-all', getAllProduct);

// router.get('/get-search', getSearchProduct);

router.post('/create', createProduct);
router.put('/update/:id', updateProduct);
router.delete('/delete/:id', deleteProduct);


router.get('/search',getSearchProduct);


module.exports = router;