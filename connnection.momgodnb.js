const mongoose = require("mongoose");

exports.connectDb = async () => {
    try {
        await mongoose.connect("mongodb+srv://ak3264114:taskmanager@cluster0.6iu6khj.mongodb.net/");
        console.log("Connected to mongoDb");
    } catch (error) {
        console.log("An error occoured in connecting mongoDb", error);
    }
};