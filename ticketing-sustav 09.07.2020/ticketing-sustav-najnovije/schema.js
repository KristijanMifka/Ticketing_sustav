const mongoose = require("mongoose");

const user = new mongoose.Schema({
  username: String,
  password: String,
  role: String,
});

const ticket = new mongoose.Schema({
  rdb: Number,
  title: String,
  subject: String,
  content: String,
  reviewer: String,
  dateOfCreation: Date,
  closeDate: Date,
  resolvedReason: String,
  status: String,
});

module.exports = { user, ticket };
