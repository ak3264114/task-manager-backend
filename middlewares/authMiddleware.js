const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/responseUtil');

const isAuthenticated = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) {
        return errorResponse(res, 401, 'Unauthorized: Missing token');
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.id;

        next();
    } catch (error) {
        return errorResponse(res, 401, 'Unauthorized: Invalid token');
    }
};

module.exports = isAuthenticated;
