const express = require("express");
require('express-async-errors');
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const blogRouter = require("./controllers/blogRouter");
const userRouter = require("./controllers/userRouter");
const loginRouter = require('./controllers/loginRouter');
const config = require("./utils/config");

const errorHandler = (error, request, response, next) => {
    if (error.name === 'CastError') {
      return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
      return response.status(400).json({ error: error.message })
    } else if (error.name === 'MongoServerError' && error.message.includes('E11000 duplicate key error')) {
      return response.status(400).json({ error: 'expected `username` to be unique' })
    } else if (error.name ===  'JsonWebTokenError') {
      return response.status(401).json({ error: 'token invalid' })
    }

    next(error)
  }

app.use(cors());
app.use(express.json());
app.use("/api/blogs", blogRouter);
app.use("/api/users", userRouter);
app.use("/api/login", loginRouter);
app.use(errorHandler)

console.log("Connecting", config.MONGODB_URI);
mongoose.connect(config.MONGODB_URI).then(() => console.log("Connection successful"));

module.exports = app;
