var _ = require("lodash");

const dummy = (blogs) => {
	return 1;
};

const totalLikes = (blogs) => {
	if (blogs.length === 0) {
		return 0;
	} else {
		const likes = blogs.map((blog) => blog.likes);
		return likes.reduce((a, b) => a + b);
	}
};

const favoriteBlog = (blogs) => {
	console.log("🚀 ~ favoriteBlog ~ blogs:", blogs);
	if (blogs.length === 0) {
		return null;
	} else {
		const likes = blogs.map((blog) => blog.likes);
		return blogs[likes.indexOf(Math.max(...likes))];
	}
};

const mostBlogs = (blogs) => {
	//receives an array of blogs as a parameter. The function returns the author who has the largest amount of blogs. The return value also contains the number of blogs the top author has.
	if (blogs.length === 0) {
		return null;
	} else {
		const authors = blogs.map((blog) => blog.author);
		console.log("🚀 ~ mostBlogs ~ authors:", authors);
		const authorCount = _.countBy(authors);
		console.log("🚀 ~ mostBlogs ~ authorCount:", authorCount);
		const authorKey = Object.keys(authorCount).reduce((a, b) => (authorCount[a] > authorCount[b] ? a : b));
		console.log("🚀 ~ mostBlogs ~ authorKey:", authorKey);
		return {
			author: authorKey,
			blogs: authorCount[authorKey],
		};
	}
};

const mostLikes = (blogs) => {
	//receives an array of blogs as its parameter. The function returns the author, whose blog posts have the largest amount of likes. The return value also contains the total number of likes that the author has received:
	if (blogs.length === 0) {
		return null;
	} else {
		const groupedByAuthor = _.groupBy(blogs, "author");
		const authorLikes = _.map(groupedByAuthor, (blogs, author) => ({
			author,
			likes: _.sumBy(blogs, "likes"),
		}));
		console.log("🚀 ~ authorLikes ~ authorLikes:", authorLikes);
		const likes = authorLikes.map((author) => author.likes);
		console.log("🚀 ~ mostLikes ~ likes:", likes);
		const mostLikedAuthor = authorLikes[likes.indexOf(Math.max(...likes))];
		console.log("🚀 ~ mostLikes ~ mostLikedAuthor:", mostLikedAuthor);
		return mostLikedAuthor;
	}
};

module.exports = {
	dummy,
	totalLikes,
	favoriteBlog,
	mostBlogs,
	mostLikes,
};
