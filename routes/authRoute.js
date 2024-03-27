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
    getHandleEventHook,
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
router.get('/get-order/:id', authAccess, getOrderById);
router.put('/order/update-order/:id' , authAccess ,updateOrderStatus);
router.get('/get-all-orders', getAllOrder);
router.post('/get-order-by-user/:id', getAllOrder);

router.get('/get-invoice/:id', getInvoiceById);
router.post('/create-invoice', createInvoice);


/*----------------------- Google OAuth ----------------------*/
router.get('/google', passport.authenticate('google', { scope: ['email', 'profile'] }));

router.get('/google/callback', passport.authenticate('google', { failureRedirect: 'http://localhost:3000/login' }), async (req, res) => {
    const profile = req.user; 
    const access_token = generateAccessToken(profile.user_id, profile.user_type);
    const refresh_token = generateRefreshToken(profile.user_id, profile.user_type); 

    console.log(access_token,refresh_token);

    if(req.user.role === 'admin'){
        return res.redirect(`http://localhost:3000/dashboard`);
    }
    else {
        return res.redirect(`http://localhost:3000?access_token=${access_token}&refresh_token=${refresh_token}`);
    }
    
});

/*----------------------------------------------------------*/

/*----------------------- Webhook Simulator Service ----------------------*/

router.post('/webhook', getHandleEventHook);


/*----------------------------------------------------------*/
module.exports = router

