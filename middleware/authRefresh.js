const jwt = require('jsonwebtoken');

const verifyRefreshToken = async (req, res, next) => {
    try {
        const tokenRefresh = req.headers['authorization'];

        if (!tokenRefresh?.startsWith('Bearer')) {
            return res.status(403).send('A token is required for authentication');
        }

        const refreshToken = tokenRefresh.split(' ')[1];

        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        if (!decoded) {
            return res.status(401).json({ error: 'Invalid refresh token' });
        }

        req.user = decoded;
        delete req.user.exp;
        delete req.user.iat;

        next();

    } catch (error) {
        return res.status(500).json({ error: 'An error occurred while fetching user data.' });
    }
};

module.exports = verifyRefreshToken;
