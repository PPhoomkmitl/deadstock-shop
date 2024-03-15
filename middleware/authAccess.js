const jwt = require('jsonwebtoken');

const verifyAccessToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader?.startsWith('Bearer') || authHeader === 'Bearer null') {
        return res.status(403).send('A token is required for authentication');
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).send('Invalid Token');
    }
};

module.exports = verifyAccessToken;
