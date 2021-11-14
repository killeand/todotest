const Mongoose = require('mongoose');

const TASK_SCHEMA = new Mongoose.Schema({
    text: String,
    checked: Boolean
});

module.exports = Mongoose.model("Task", TASK_SCHEMA, "Task");