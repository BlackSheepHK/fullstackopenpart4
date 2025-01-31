const blogRouter = require("express").Router();
const jwt = require("jsonwebtoken");
const Blog = require("../models/blog");
const User = require("../models/user");

blogRouter.get("/", async (request, response) => {
	const blogs = await Blog.find({}).populate("user");
	console.log("Get blogs:", blogs)
	response.json(blogs);
});

blogRouter.post("/", async (request, response) => {
	console.log("Request to create blog received.");
	if (!request.user) {
		return response.status(401).json({ error: "user login required" })
	}
	// const decodedToken = jwt.verify(request.token, process.env.LOGIN_SECRET);
	// console.log("Decoded token:", decodedToken);
	// if (!decodedToken.id) {
	// 	return response.status(401).json({ error: "token invalid" });
	// }

	const user = await User.findById(request.user.id);

	const blog = new Blog({
		...request.body,
		user: user.id,
	});

	console.log("Creating:", blog, "User: ", user);
	const blogCreated = await blog.save();

	user.blogs = user.blogs.concat(blogCreated._id);
	await user.save();

	response.status(201).json(blogCreated);
});

blogRouter.delete("/:id", async (request, response) => {
	const id = request.params.id;
	console.log("Request to delete blog received:", id);

	if (!request.user) {
		return response.status(401).json({ error: "user login required" })
	}
	// const decodedToken = jwt.verify(request.token, process.env.LOGIN_SECRET);
	// console.log("Decoded token:", decodedToken);
	// if (!decodedToken.id) {
	// 	return response.status(401).json({ error: "token invalid" });
	// }

	const blogToDelete = await Blog.findById(id).populate("user");
	console.log("blogToDelete", blogToDelete)

	if (blogToDelete.user.id!=request.user.id) {
		return response.status(401).json({ error: "blog to delete is not created by you" });
	}

	await Blog.findByIdAndDelete(id)

	response.status(204).end()
});

blogRouter.put("/:id", (request, response) => {
	Blog.findByIdAndUpdate(request.params.id, request.body, { new: true, runValidators: true, context: "query" })
		.then((result) => {
			response.json(result);
		})
		.catch((error) => {
			console.log("Update error:", error.message)
			response.status(400).json({ error: error.message });
		});
});

module.exports = blogRouter;
