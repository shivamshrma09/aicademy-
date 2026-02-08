const mongoose = require('mongoose');

const TestSeriesSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  Testname: { type: String, required: true },
  description: { type: String },
  subject: { type: String, required: true },
  tests: [{
    title: { type: String, required: true },
    level: { type: String, required: true },
    questions: [{
      question: { type: String, required: true },
      options: {
        A: String,
        B: String,
        C: String,
        D: String
      },
      correctAnswer: { type: String, required: true }
    }]
  }],
  createdAt: { type: Date, default: Date.now }
});

const TestResultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  testSeriesId: { type: mongoose.Schema.Types.ObjectId, ref: 'TestSeries', required: true },
  testName: { type: String, required: true },
  testTitle: { type: String, required: true },
  level: { type: String, required: true },
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  dateCompleted: { type: Date, default: Date.now }
});

module.exports = {
  TestSeries: mongoose.model('TestSeries', TestSeriesSchema),
  TestResult: mongoose.model('TestResult', TestResultSchema)
};
