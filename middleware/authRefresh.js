const jwt = require('jsonwebtoken');
const dbConnect = require('../config/dbConnect');

const verifyRefreshToken = async (req, res, next) => {
    try {
        const tokenRefresh = req.headers['authorization'];

        if (!tokenRefresh || !tokenRefresh.startsWith('Bearer')) {
            return res.status(403).send('A token is required for authentication');
        }

        const refreshToken = tokenRefresh.split(' ')[1];

        jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).json({ error: 'Invalid refresh token' });
            }

            req.user = decoded;
            req.user.token = tokenRefresh;
            delete req.user.exp;
            delete req.user.iat;

            next();
        });
    } catch (error) {
        return res.status(500).json({ error: 'An error occurred while fetching user data.' });
    }
};

module.exports = verifyRefreshToken;
