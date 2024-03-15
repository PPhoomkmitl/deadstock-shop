const express = require("express");
const {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategory,
  getallCategory
} = require("../controller/productCategoryController");
const authAccess = require('../middleware/authAccess')
const isAdmin = require('../middleware/isAdmin')
const router = express.Router();

router.post("/create-category", createCategory);
router.put("/update-category/:id", updateCategory);
router.delete("/delete-category/:id", deleteCategory);
router.get("/get-category/:id", getCategory);
router.get("/get-all/" ,getallCategory);

module.exports = router;