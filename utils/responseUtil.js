const successResponse = (res, statusCode, message, data = null) => {
	res.status(statusCode).json({ error: false, message, data });
};

const errorResponse = (res, statusCode, message) => {
	res.status(statusCode).json({ error: true, message });
};

module.exports = {
	successResponse,
	errorResponse,
};
