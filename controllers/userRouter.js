const userRouter = require("express").Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");

userRouter.get("/", async (request, response) => {
    const users = await User.find({}).populate('blogs')
	response.json(users)
});

userRouter.post("/", async (request, response) => {
	const { username, name, password } = request.body;

	if (username.length <= 3 || password.length <= 3) {
		response.status(400).json({ error: "username and password length must be greater than 3" });
	}

	const saltRounds = 10;
	const passwordHash = await bcrypt.hash(password, saltRounds);

	const user = new User({
		username,
		name,
		passwordHash,
	});

	const savedUser = await user.save();

	response.status(201).json(savedUser);
});

module.exports = userRouter;
