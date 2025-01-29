const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const blogRouter = require("./controllers/blogRouter");
const config = require("./utils/config");

app.use(cors());
app.use(express.json());
app.use("/api/blogs", blogRouter);

console.log("Connecting", config.MONGODB_URI);
mongoose.connect(config.MONGODB_URI).then(() => console.log("Connection successful"));

module.exports = app;
