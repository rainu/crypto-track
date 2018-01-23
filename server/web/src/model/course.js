"use strict";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CourseSchema = new Schema({
  symbol: {
    type: String,
  },
  date: {
    type: Date,
  },
  course: {
    type: Number,
  },
  type: {
    type: String,
  }
});

CourseSchema.index({ symbol: 1, date: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('course', CourseSchema);