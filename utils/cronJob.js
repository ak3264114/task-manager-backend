const cron = require("node-cron");
const twilio = require("twilio");
const User = require("../models/UserModel");
const Task = require("../models/TaskModel");
const { calculatePriority } = require("./helper");

const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.ACCOUNT_AUTH_TOKEN;
const client = new twilio(accountSid, authToken);

async function getUsersSortedByPriority() {
	try {
		const users = await User.find({}).sort({ priority: 1 });
		return users;
	} catch (error) {
		console.error("Error fetching users:", error);
		throw error;
	}
}

async function makeTwilioCall(toPhoneNumber) {
	try {
		const call = await client.calls.create({
			url: "http://demo.twilio.com/docs/voice.xml",
			to: toPhoneNumber,
			from: "+12674353541",
		});
		console.log(`Call initiated with SID: ${call.sid}`);
		return call.sid;
	} catch (error) {
		console.error(`Error making Twilio call: ${error.message}`);
		throw error;
	}
}

exports.checkCallAnsweredOrNot = (req, res) => {
	const { CallSid, CallStatus } = req.body;
	console.log(
		`Received status callback for Call SID ${CallSid}. Status: ${CallStatus}`,
	);
	if (CallStatus === "completed") {
		console.log("Call was answered. Stopping further calls.");
		res.status(200).end();
	} else {
		res.status(200).end();
	}
};

exports.scheduleTwilioCall = () => {
	cron.schedule("33 11 * * *", async () => {
		console.log("Scheduling Twilio call...");
		const users = await getUsersSortedByPriority();
		for (const user of users) {
			try {
                await updatePendingAndInProgressPriorities();
				const callSid = await makeTwilioCall(user.phone_number);
				console.log(
					`Call successfully initiated for user with phone number ${user.phone_number}, Call SID: ${callSid}`,
				);
				break;
			} catch (error) {
				console.error(
					`Error making Twilio call for user with phone number ${user.phone_number}: ${error.message}`,
				);
			}
		}
	});
};

async function updatePendingAndInProgressPriorities() {
	try {
		const pendingTasks = await Task.find({ status: "TODO" });
		for (const task of pendingTasks) {
			const newPriority = calculatePriority(task.dueDate);
			await Task.findByIdAndUpdate(task._id, { priority: newPriority });
		}
		const inProgressTasks = await Task.find({ status: "IN_PROGRESS" });
		for (const task of inProgressTasks) {
			const newPriority = calculatePriority(task.dueDate);
			await Task.findByIdAndUpdate(task._id, { priority: newPriority });
		}

		console.log("Priorities updated for pending and in-progress tasks.");
	} catch (error) {
		console.error("Error updating priorities:", error);
		throw error;
	}
}
