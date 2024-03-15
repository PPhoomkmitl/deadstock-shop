const express = require('express')
const {
    userRegister,
    userLogin,
    createRefreshToken,
    loginAdmin,
    saveAddress,
    userCart,
    getUserCart,
    emptyCart,
    createOrder,
    getOrder,
    updateOrderStatus
} = require('../controller/userController')

const authAccess = require('../middleware/authAccess')
const authRefresh = require('../middleware/authRefresh')
const isAdmin = require('../middleware/isAdmin')
const router = express.Router()

// router.put("/update-user", updatedUser);
router.post('/admin-login', loginAdmin);
// router.post('/admin-protected', isAdmin);


router.get('/cart', authAccess , getUserCart);
router.delete('/clear-cart', authAccess , emptyCart);
router.post('/add-cart', authAccess, userCart);



router.post('/register', userRegister);
router.post('/login', userLogin);
router.post('/refresh', authRefresh  , createRefreshToken);


router.put('/save-address', authAccess, saveAddress);

router.post('/create-order', authAccess, createOrder);
router.get('/get-order', authAccess, getOrder);
router.put('/order/update-order/:id' , authAccess ,updateOrderStatus);
// router.get("/get-all-orders", authAccess, isAdmin, getAllOrders);
// router.post("/get-order-by-user/:id", authAccess, isAdmin, getAllOrders);

module.exports = router