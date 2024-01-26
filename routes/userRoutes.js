const express = require("express");

const isAuthenticated = require("../middlewares/authMiddleware");
const { addUser } = require("../controllers/userController");

const router = express.Router();

router.post("/add", isAuthenticated, addUser);
module.exports = router;
