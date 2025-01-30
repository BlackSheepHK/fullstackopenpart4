const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const loginRouter = require("express").Router();
const User = require("../models/user");
const config = require("../utils/config");

loginRouter.post("/", async (request, response) => {
	const { username, password } = request.body;
    console.log("Finding user with:", request.body)
	const user = await User.findOne({ username });
	const passwordCorrect = user === null ? false : await bcrypt.compare(password, user.passwordHash);
    console.log("Is password correct?", passwordCorrect)
	if (!(user && passwordCorrect)) {
		return response.status(401).json({
			error: "invalid username or password",
		});
	}

	const userForToken = {
		username: user.username,
		id: user._id,
	};
    console.log("userForToken:", userForToken)
    console.log("Secret", config.LOGIN_SECRET)
	const token = jwt.sign(userForToken, config.LOGIN_SECRET);
    console.log("Token", token)

	response.status(200).send({ token, username: user.username, name: user.name });
});

module.exports = loginRouter;
