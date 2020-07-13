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
  user: Object,
  reviewer: Object,
  dateOfCreation: Date,
  closeDate: Date,
  resolvedReason: String,
  status: String,
});

const User = mongoose.model("User", user);
const Ticket = mongoose.model("Ticket", ticket);

module.exports = { User, user, Ticket };
