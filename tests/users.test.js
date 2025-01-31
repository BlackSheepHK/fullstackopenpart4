const { test, describe, after, beforeEach } = require("node:test");
const assert = require("node:assert");
const listHelper = require("../utils/list_helper");
const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const api = supertest(app);
const Blog = require("../models/blog");
const User = require("../models/user");
let token = "" //Global scope
let initialBlogId = "" //Global scope

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
	console.log("Wiping all test blogs")
		await Blog.deleteMany({});

	console.log("Creating initial test users");
	const promiseArray = initialUsers.map(async (user) => {
		await api.post("/api/users").send(user);
	});
	await Promise.all(promiseArray);

	const user = initialUsers[2]
	console.log("Loggin in as:", user)
	const response = await api.post("/api/login").send(user).expect(200)
	console.log("Login response:", response.body)
	token = response.body.token

	const newBlog= {
		title: "Initial test blog by peter3",
		author: "peter3",
		url: "https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf",
		likes: 155,
	}
	console.log("Creating initial test blog:", newBlog)
	const createResponse = await api
		.post("/api/blogs")
		.set('Authorization', `Bearer ${token}`)
		.send(newBlog)
		.expect(201)
	initialBlogId = createResponse.body.id
});

describe("api tests for users", () => {
	test("3 initial test users are created", async () => {
		const users = await api.get("/api/users");
		console.log("Initial users:", users.body.length);
		assert.strictEqual(users.body.length, 3);
	});

	test("Creating duplicated user should return error", async () => {
		const newUser = {
			username: "peter1",
			name: "Peter One",
			password: "peter123",
		};
		const response = await api.post("/api/users").send(newUser).expect(400);
		assert(response.body.error.includes("expected `username` to be unique"));
	});

	test("Creating user with username with <= 3 characters should return error", async () => {
		const newUser = {
			username: "pet",
			name: "Peter One",
			password: "peter123",
		};
		const response = await api.post("/api/users").send(newUser).expect(400);
		assert(response.body.error.includes("username and password length must be greater than 3"));
	});

	test("Creating user with password with <= 3 characters should return error", async () => {
		const newUser = {
			username: "peter4",
			name: "Peter One",
			password: "pet",
		};
		const response = await api.post("/api/users").send(newUser).expect(400);
		assert(response.body.error.includes("username and password length must be greater than 3"));
	});

	test("Login and get token", async () => {
		const user = initialUsers[1]
		console.log("Logging in with:", user)
		const response = await api.post("/api/login").send(user).expect(200)
		console.log("Login response:", response.body)
		assert(Object.keys(response.body).includes("token"));
	});

	test("Create blog after logging in", async () => {
		const newBlog= {
			title: "Go To Statement Considered Harmful",
			author: "A",
			url: "https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf",
			likes: 5,
		}
		const response = await api
			.post("/api/blogs")
			.set('Authorization', `Bearer ${token}`)
			.send(newBlog)
        	.expect(201)
		console.log("Create blog response:", response.body)
	});

	test("Create blog without logging in", async () => {
		const newBlog= {
			title: "Go To Statement Considered Harmful",
			author: "A",
			url: "https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf",
			likes: 5,
		}
		const response = await api
			.post("/api/blogs")
			.send(newBlog)
        	.expect(401)
		console.log("Create blog response:", response.body)
	});

	test("Delete blog as user who created it, expect success", async() => {
		await api
			.delete(`/api/blogs/${initialBlogId}`)
			.set('Authorization', `Bearer ${token}`)
			.expect(204)
	});

	test("Delete blog without logging in, expect failure", async() => {
		await api
			.delete(`/api/blogs/${initialBlogId}`)
			.expect(401)
	});

	test("Delete blog as another user, expect failure", async() => {
		const user = initialUsers[1]
		const response = await api.post("/api/login").send(user).expect(200)
		console.log("Login response:", response.body)

		await api
			.delete(`/api/blogs/${initialBlogId}`)
			.set('Authorization', `Bearer ${response.body.token}`)
			.expect(401)
	})

});

after(async () => {
	await mongoose.connection.close();
	console.log("Connection closed");
});
