const blogRouter = require("express").Router();
const jwt = require("jsonwebtoken");
const Blog = require("../models/blog");
const User = require("../models/user");

const getTokenFrom = request => {
	const authorization = request.get('authorization')
	if (authorization && authorization.startsWith('Bearer ')) {
	  return authorization.replace('Bearer ', '')
	}
	return null
  }

blogRouter.get("/", async (request, response) => {
	const blogs = await Blog.find({}).populate('user')
	response.json(blogs);
});

blogRouter.post("/", async (request, response) => {
	console.log("Request to create blog received.")
	const decodedToken = jwt.verify(getTokenFrom(request), process.env.LOGIN_SECRET)
	console.log("Decoded token:", decodedToken)
	if (!decodedToken.id) {
		return response.status(401).json({ error: 'token invalid' })
	}

	const user = await User.findById(decodedToken.id)

	const blog = new Blog({
		...request.body,
		user: user.id,
	});

	console.log("Creating:", blog, "User: ", user);
	const blogCreated = await blog.save();

	user.blogs = user.blogs.concat(blogCreated._id)
	await user.save()

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
