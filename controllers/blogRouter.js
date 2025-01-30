const blogRouter = require("express").Router();
const Blog = require("../models/blog");
const User = require("../models/user");

blogRouter.get("/", async (request, response) => {
	const blogs = await Blog.find({}).populate('user')
	response.json(blogs);
});

blogRouter.post("/", async (request, response) => {
	const users = await User.find({});

	const firstUser = users[0]

	const blog = new Blog({
		...request.body,
		user: firstUser.id,
	});

	console.log("Creating:", request.body, "User: ", firstUser);
	const blogCreated = await blog.save();

	firstUser.blogs = firstUser.blogs.concat(blogCreated._id)
	await firstUser.save()

	response.status(201).json(blogCreated);
});

blogRouter.delete("/:id", (request, response) => {
	const id = request.params.id;
	Blog.findByIdAndDelete(id)
		.then((result) => response.status(204).end())
		.catch((error) => {
			response.status(400).json({ error: error.message });
		});
});

blogRouter.put("/:id", (request, response) => {
	Blog.findByIdAndUpdate(request.params.id, request.body, { new: true, runValidators: true, context: "query" })
		.then((result) => {
			response.json(result);
		})
		.catch((error) => {
			response.status(400).json({ error: error.message });
		});
});

module.exports = blogRouter;
