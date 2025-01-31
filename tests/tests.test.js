const { test, describe, after, beforeEach } = require("node:test");
const assert = require("node:assert");
const listHelper = require("../utils/list_helper");
const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const api = supertest(app);
const Blog = require("../models/blog");
const User = require("../models/user");
let token = ""; //Global scope

const emptyList = [];
const listWithOneBlog = [
	{
		title: "Go To Statement Considered Harmful",
		author: "A",
		url: "https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf",
		likes: 5,
	},
];
const listWithThreeBlogs = [
	{
		title: "Go To Statement Considered Harmful",
		author: "A",
		url: "https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf",
		likes: 5,
	},
	{
		title: "Go To Statement Considered Harmful",
		author: "B",
		url: "https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf",
		likes: 10,
	},
	{
		title: "Go To Statement Considered Harmful",
		author: "C",
		url: "https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf",
		likes: 15,
	},
];
const listWithManyBlogs = [
	{
		title: "React patterns",
		author: "Michael Chan",
		url: "https://reactpatterns.com/",
		likes: 7,
	},
	{
		title: "Go To Statement Considered Harmful",
		author: "Edsger W. Dijkstra",
		url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
		likes: 5,
	},
	{
		title: "Canonical string reduction",
		author: "Edsger W. Dijkstra",
		url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
		likes: 12,
	},
	{
		title: "First class tests",
		author: "Robert C. Martin",
		url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
		likes: 10,
	},
	{
		title: "TDD harms architecture",
		author: "Robert C. Martin",
		url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
		likes: 0,
	},
	{
		title: "Type wars",
		author: "Robert C. Martin",
		url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
		likes: 2,
	},
];
const listWithBlogWithoutLike = [
	{
		title: "Go To Statement Considered Harmful",
		author: "A",
		url: "https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf",
	},
];
const listWithBlogWithoutAuthor = [
	{
		title: "Go To Statement Considered Harmful",
		url: "https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf",
	},
];
const listWithBlogWithoutURL = [
	{
		title: "Go To Statement Considered Harmful",
		author: "A",
	},
];
const initialUsers = [
	{
		username: "peter1",
		name: "Peter One",
		password: "peter123",
	},
	{
		username: "peter2",
		name: "Peter Two",
		password: "peter123",
	},
	{
		username: "peter3",
		name: "Peter Three",
		password: "peter123",
	},
];

beforeEach(async () => {
	console.log("Wiping all test users");
	await User.deleteMany({});
	console.log("Creating initial test users");
	const promiseArray = initialUsers.map(async (user) => {
		await api.post("/api/users").send(user);
	});
	await Promise.all(promiseArray);

	const user = initialUsers[2];
	console.log("Loggin in as:", user);
	const response = await api.post("/api/login").send(user).expect(200);
	console.log("Login response:", response.body);
	token = response.body.token;

	console.log("Wiping all test blogs")
	await Blog.deleteMany({});
	console.log("Creating test blogs")
	const promiseArrayBlogs = listWithManyBlogs.map(async (blog) => {
		await api.post("/api/blogs").set("Authorization", `Bearer ${token}`).send(blog);
	});
	await Promise.all(promiseArrayBlogs);
	console.log("Creating test blogs successful")
});

describe("api tests for blogs", () => {
	test("blogs are returned as json", async () => {
		await api
			.get("/api/blogs")
			.expect(200)
			.expect("Content-Type", /application\/json/);
	});

	test("blogs use id as identifier", async () => {
		const blogs = await api.get("/api/blogs");
		console.log("blogs.body", blogs.body)
		console.log("Keys:", Object.keys(blogs.body[0]));
		assert(Object.keys(blogs.body[0]).includes("id"));
	});

	test("blogs increase by 1 after creation", async () => {
		const blogs = await api.get("/api/blogs");
		console.log("Original legnth", blogs.body.length);
		await api.post("/api/blogs").set("Authorization", `Bearer ${token}`).send(listWithOneBlog[0]);
		const blogsAfterCreation = await api.get("/api/blogs");
		console.log("🚀 ~ test ~ blogsAfterCreation:", blogsAfterCreation.body);
		console.log("Legnth after creation", blogsAfterCreation.body.length);
		assert.strictEqual(blogs.body.length + 1, blogsAfterCreation.body.length);
	});

	test("request without likes get 0", async () => {
		await api.post("/api/blogs").set('Authorization', `Bearer ${token}`).send(listWithBlogWithoutLike[0]);
		console.log("New blog posted:", listWithBlogWithoutLike[0]);
		const blogs = await api.get("/api/blogs");
		const finalBlog = blogs.body.slice(-1)[0];
		console.log("New blog retrived:", finalBlog);
		assert.strictEqual(finalBlog.likes, 0);
	});

	test("request without author", async () => {
		console.log("New blog posted:", listWithBlogWithoutAuthor[0]);
		await api.post("/api/blogs").set('Authorization', `Bearer ${token}`).send(listWithBlogWithoutAuthor[0]).expect(400);
	});

	test("request without url", async () => {
		console.log("New blog posted:", listWithBlogWithoutURL[0]);
		await api.post("/api/blogs").set('Authorization', `Bearer ${token}`).send(listWithBlogWithoutURL[0]).expect(400);
	});

	test("delete a post", async () => {
		const blogs = await api.get("/api/blogs");
		const originalLength = blogs.body.length;
		console.log("Length before delete:", originalLength);
		const id = blogs.body[0].id;
		console.log("Deleting a post:", id);
		await api.delete(`/api/blogs/${id}`).set('Authorization', `Bearer ${token}`).expect(204);
		const blogsAfter = await api.get("/api/blogs");
		const newLength = blogsAfter.body.length;
		console.log("Length after delete:", newLength);
		assert.strictEqual(originalLength - 1, newLength);
	});

	test("update number of likes", async () => {
		const blogs = await Blog.find({});
		console.log("update number of likes – blogs", blogs)
		const thirdBlog = blogs[2];
		console.log("Third blog before:", thirdBlog);
		const addOneLike = {
			...thirdBlog.doc,
			likes: thirdBlog.likes + 1,
		};
		console.log("addOneLike", addOneLike)
		await api.put(`/api/blogs/${thirdBlog.id}`).send(addOneLike).expect(200);
		const blogsAfter = await api.get("/api/blogs");
		const newThirdBlog = blogsAfter.body[2];
		console.log("Third blog after:", newThirdBlog);
		assert.strictEqual(thirdBlog.id, newThirdBlog.id);
		assert.strictEqual(thirdBlog.likes + 1, newThirdBlog.likes);
	});
});

test("dummy returns one", () => {
	const blogs = [];

	const result = listHelper.dummy(blogs);
	assert.strictEqual(result, 1);
});

describe("total likes", () => {
	test("when list has only one blog, equals the likes of that", () => {
		const result = listHelper.totalLikes(listWithOneBlog);
		assert.strictEqual(result, 5);
	});

	test("when list has three blogs, equals the likes of that", () => {
		const result = listHelper.totalLikes(listWithThreeBlogs);
		assert.strictEqual(result, 30);
	});

	test("when there is no item in the list, equals 0", () => {
		const result = listHelper.totalLikes(emptyList);
		assert.strictEqual(result, 0);
	});
});

describe("favourite blog", () => {
	test("when list has only one blog, equals that blog", () => {
		const result = listHelper.favoriteBlog(listWithOneBlog);
		assert.strictEqual(result, listWithOneBlog[0]);
	});

	test("when list has three blogs, equals that with most likes", () => {
		const result = listHelper.favoriteBlog(listWithThreeBlogs);
		assert.strictEqual(result, listWithThreeBlogs[2]);
	});

	test("when there is no item in the list, equals null", () => {
		const result = listHelper.favoriteBlog(emptyList);
		assert.equal(result, null);
	});
});

describe("author with most blogs", () => {
	test("when there is no item in the list, equals null", () => {
		const result = listHelper.mostBlogs(emptyList);
		assert.equal(result, null);
	});

	test("when list has only one blog, equals that blog's author", () => {
		const result = listHelper.mostBlogs(listWithOneBlog);
		console.log("result is", result);
		assert.deepStrictEqual(result, { author: "A", blogs: 1 });
	});

	test("when list has many blogs, equals that author with most blogs", () => {
		const result = listHelper.mostBlogs(listWithManyBlogs);
		console.log("result is", result);
		assert.deepStrictEqual(result, { author: "Robert C. Martin", blogs: 3 });
	});
});

describe("author with most likes", () => {
	test("when there is no item in the list, equals null", () => {
		const result = listHelper.mostLikes(emptyList);
		assert.equal(result, null);
	});

	test("when list has only one blog, equals that blog's author", () => {
		const result = listHelper.mostLikes(listWithOneBlog);
		console.log("result is", result);
		assert.deepStrictEqual(result, { author: "A", likes: 5 });
	});

	test("when list has many blogs, equals that author with most likes", () => {
		const result = listHelper.mostLikes(listWithManyBlogs);
		console.log("result is", result);
		assert.deepStrictEqual(result, { author: "Edsger W. Dijkstra", likes: 17 });
	});
});

after(async () => {
	await mongoose.connection.close();
	console.log("Connection closed");
});
