
const express = require('express');
const { connectDb } = require('./connnection.momgodnb');
const app = express();
const dotenv = require("dotenv");
dotenv.config()
const taskRoutes = require('./routes/taskRoute');
const subTaskRoutes = require('./routes/subTaskRoutes');
const userRoutes = require('./routes/userRoutes');
const {  checkCallAnsweredOrNot, scheduleTwilioCall } = require('./utils/cronJob');



app.use(express.json());
const PORT = process.env.PORT || 3000;
connectDb();

scheduleTwilioCall();

app.post('/twilio-status-callback', checkCallAnsweredOrNot)
app.use('/tasks', taskRoutes);
app.use('/subtasks', subTaskRoutes);
app.use('/user', userRoutes);


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});