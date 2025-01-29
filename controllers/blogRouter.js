const blogRouter = require("express").Router();
const Blog = require("../models/blog");

blogRouter.get("/", (request, response) => {
	Blog.find({}).then((blogs) => {
		response.json(blogs);
	});
});

blogRouter.post("/", (request, response) => {
	const blog = new Blog(request.body);
	console.log("Creating:", request.body);
	blog.save()
		.then((result) => {
			response.status(201).json(result);
		})
		.catch((error) => {
			response.status(400).json({ error: error.message });
		});
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
