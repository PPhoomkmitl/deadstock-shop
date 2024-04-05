const express = require('express')
const passport = require('passport');

const { generateAccessToken } = require('../config/genJwtAccessToken');
const { generateRefreshToken } = require('../config/genJwtRefreshToken');

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
    getOrderById,
    updateOrderStatus,
    getCheckLogin,
    getAllOrder,
    createInvoice ,
    getInvoiceById,
    getOrderByUserId,
    getAddress,
    getDashboardAdmin
    // getHandleEventHook,
} = require('../controller/userController')

const authAccess = require('../middleware/authAccess')
const authRefresh = require('../middleware/authRefresh')
const isAdmin = require('../middleware/isAdmin');
const router = express.Router()

router.post('/admin-login', isAdmin ,loginAdmin);

router.get('/cart', authAccess , getUserCart);
router.delete('/clear-cart/:id', authAccess , emptyCart);
router.post('/add-cart', authAccess, addUserCart);

router.post('/register', userRegister);
router.post('/login', userLogin);

router.post('/refresh', authRefresh  , createRefreshToken);
router.get('/check-login', authAccess  , getCheckLogin);

router.put('/save-address', authAccess ,saveAddress);
router.get('/get-address', authAccess, getAddress);

router.post('/create-order', authAccess, isAdmin ,createOrder);
router.get('/get-order/:id', authAccess, getOrderById);
router.put('/order/update-order' , authAccess , isAdmin ,updateOrderStatus);

router.get('/get-all-orders', authAccess ,getAllOrder);
router.get('/get-order-by-user',  authAccess, getOrderByUserId);

router.get('/get-invoice/:id',authAccess ,  getInvoiceById);
router.post('/create-invoice', authAccess , createInvoice);

router.get('/get-dashboard', authAccess , isAdmin ,getDashboardAdmin);

/*----------------------- Google OAuth ----------------------*/
router.get('/google', passport.authenticate('google', { scope: ['email', 'profile'] }));

router.get('/google/callback', passport.authenticate('google', { failureRedirect: 'http://localhost:3000/login' }), async (req, res) => {
    const profile = req.user; 
    const access_token = generateAccessToken(profile.user_id, profile.user_type);
    const refresh_token = generateRefreshToken(profile.user_id, profile.user_type); 

    console.log('access 1 -->',access_token);
    console.log('refresh 2 -->',refresh_token)

    console.log('profile.user_type' , profile.user_type)

    if(profile.user_type === 'user_admin' || profile.user_type === 'super_admin'){
        return res.redirect(`http://localhost:3000/dashboard?access_token=${access_token}&refresh_token=${refresh_token}`);
    }
    else {
        return res.redirect(`http://localhost:3000?access_token=${access_token}&refresh_token=${refresh_token}`);
    }
    
});

module.exports = router

