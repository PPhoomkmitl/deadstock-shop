const express = require('express')
const {
    userRegister,
    userLogin,
    createRefreshToken

} = require('../controller/userController')
const authAccess = require('../middleware/authAccess')
const authRefresh = require('../middleware/authRefresh')
const router = express.Router()

router.post('/register', userRegister)
router.post('/login', userLogin)
router.post('/auth/refresh', authRefresh , createRefreshToken)



module.exports = router