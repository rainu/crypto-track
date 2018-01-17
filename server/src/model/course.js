"use strict";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CourseSchema = new Schema({
  symbol: {
    type: String,
    unique: true
  },
  date: {
    type: Date,
  },
  course: {
    type: Number,
  }
});

module.exports = mongoose.model('course', CourseSchema);