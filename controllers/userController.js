const User = require("../models/UserModel");
const { errorResponse, successResponse } = require("../utils/responseUtil");

exports.addUser = async (req, res) => {
	try {
		const { phone_number, priority } = req.body;
		if (!phone_number) {
			return errorResponse(
				res,
				400,
				"Phone number is required",
			);
		}

		if (priority > 2 || priority < 0) {
			return errorResponse(
				res,
				400,
				"Priority should be in between 0 to 2 only",
			);
		}
		const newUser = new User({
			phone_number,
			priority: priority || 0,
		});
		await newUser.save();
		return successResponse(res, 201, "User added successfully", newUser);
	} catch (error) {
		console.error("Error adding user:", error);
		return errorResponse(res, 500, "Internal Server Error");
	}
};
