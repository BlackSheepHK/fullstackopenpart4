const { test, describe } = require("node:test");
const assert = require("node:assert");
const listHelper = require("../utils/list_helper");

const emptyList = [];
const listWithOneBlog = [
	{
		_id: "5a422aa71b54a676234d17f8",
		title: "Go To Statement Considered Harmful",
		author: "A",
		url: "https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf",
		likes: 5,
		__v: 0,
	},
];

const listWithThreeBlogs = [
	{
		_id: "5a422aa71b54a676234d17f8",
		title: "Go To Statement Considered Harmful",
		author: "A",
		url: "https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf",
		likes: 5,
		__v: 0,
	},
	{
		_id: "5a422aa71b54a676234d17f8",
		title: "Go To Statement Considered Harmful",
		author: "B",
		url: "https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf",
		likes: 10,
		__v: 0,
	},
	{
		_id: "5a422aa71b54a676234d17f8",
		title: "Go To Statement Considered Harmful",
		author: "C",
		url: "https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf",
		likes: 15,
		__v: 0,
	},
];

const listWithManyBlogs = [
	{
		_id: "5a422a851b54a676234d17f7",
		title: "React patterns",
		author: "Michael Chan",
		url: "https://reactpatterns.com/",
		likes: 7,
		__v: 0,
	},
	{
		_id: "5a422aa71b54a676234d17f8",
		title: "Go To Statement Considered Harmful",
		author: "Edsger W. Dijkstra",
		url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
		likes: 5,
		__v: 0,
	},
	{
		_id: "5a422b3a1b54a676234d17f9",
		title: "Canonical string reduction",
		author: "Edsger W. Dijkstra",
		url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
		likes: 12,
		__v: 0,
	},
	{
		_id: "5a422b891b54a676234d17fa",
		title: "First class tests",
		author: "Robert C. Martin",
		url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
		likes: 10,
		__v: 0,
	},
	{
		_id: "5a422ba71b54a676234d17fb",
		title: "TDD harms architecture",
		author: "Robert C. Martin",
		url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
		likes: 0,
		__v: 0,
	},
	{
		_id: "5a422bc61b54a676234d17fc",
		title: "Type wars",
		author: "Robert C. Martin",
		url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
		likes: 2,
		__v: 0,
	},
];

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
        const result = listHelper.mostBlogs(listWithOneBlog)
        console.log("result is", result)
        assert.deepStrictEqual(result, { author: 'A', blogs: 1 });
    });

    test("when list has many blogs, equals that author with most blogs", () => {
        const result = listHelper.mostBlogs(listWithManyBlogs)
        console.log("result is", result)
        assert.deepStrictEqual(result, { author: 'Robert C. Martin', blogs: 3 });
    })
})

describe("author with most likes", () => {
    test("when there is no item in the list, equals null", () => {
		const result = listHelper.mostLikes(emptyList);
		assert.equal(result, null);
	});

    test("when list has only one blog, equals that blog's author", () => {
        const result = listHelper.mostLikes(listWithOneBlog)
        console.log("result is", result)
        assert.deepStrictEqual(result, { author: 'A', likes: 5 });
    });

    test("when list has many blogs, equals that author with most likes", () => {
        const result = listHelper.mostLikes(listWithManyBlogs)
        console.log("result is", result)
        assert.deepStrictEqual(result, { author: 'Edsger W. Dijkstra', likes: 17 });
    })
})