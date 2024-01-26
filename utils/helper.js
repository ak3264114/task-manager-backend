exports.calculatePriority = (dueDate) => {
	const today = new Date();
	const dueDateObj = new Date(dueDate);
	const timeDifference = dueDateObj.getTime() - today.getTime();
	const daysDifference = Math.max(
		0,
		Math.floor(timeDifference / (1000 * 3600 * 24)),
	);
	return daysDifference;
};
