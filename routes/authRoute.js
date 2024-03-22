const express = require('express')
const {
    userRegister,
    userLogin,
    createRefreshToken,
    loginAdmin,
    saveAddress,
    addUserCart,
    getUserCart,
    emptyCart,
    createOrder,
    getOrder,
    updateOrderStatus,
    getCheckLogin,
    getAllOrder,
    createInvoice ,
    getInvoiceById,
    // googleAuth,
    // googleCallback,
    // successRedirect
} = require('../controller/userController')

const authAccess = require('../middleware/authAccess')
const authRefresh = require('../middleware/authRefresh')
const isAdmin = require('../middleware/isAdmin')
const router = express.Router()

// router.put('/update-user', updatedUser);
router.post('/admin-login', isAdmin ,loginAdmin);
// router.post('/admin-protected', isAdmin);

router.get('/cart', authAccess , getUserCart);
router.delete('/clear-cart/:id', authAccess , emptyCart);
router.post('/add-cart', authAccess, addUserCart);

router.post('/register', userRegister);
router.post('/login', userLogin);

router.post('/refresh', authRefresh  , createRefreshToken);
router.get('/check-login', authAccess  , getCheckLogin);

router.put('/save-address', authAccess, saveAddress);

router.post('/create-order', authAccess, createOrder);
router.get('/get-order', authAccess, getOrder);
router.put('/order/update-order/:id' , authAccess ,updateOrderStatus);
router.get('/get-all-orders', getAllOrder);
router.post('/get-order-by-user/:id', getAllOrder);

router.get('/get-invoice/:id', getInvoiceById);
router.post('/create-invoice', createInvoice);


/*----------------------- Google OAuth ----------------------*/
// router.get('/google', googleAuth);
// router.get('/google/callback', googleCallback, successRedirect);

//   passport.authenticate('google', { failureRedirect: '/login' }),
//   (req, res) => {
//     const user = req.user;
//     const token = generateToken(user);
//     res.redirect(`http://app.example.com?token=${token}`);
//   });

/*----------------------------------------------------------*/

module.exports = router

