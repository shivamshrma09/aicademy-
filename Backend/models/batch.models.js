const mongoose = require("mongoose");

const BatchSchema = new mongoose.Schema({
  id: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  title: String,
  subject: String,
  difficulty: String,
  language: String,
  estimatedTime: String,
  instructor: String,
  image: String,
  description: String,
  totalChapters: Number,
  type: String,
  progress: { type: Number, default: 0 },
  completedChapters: { type: Number, default: 0 },
  enrolledStudents: { type: Number, default: 1 },
  aiLearningPlan: {
    batchName: String,
    description: String,
    chapters: [{
      title: String,
      overview: String,
      topics: [{
        title: String,
        explanation: String,
        imageUrl: String,
        videoSearchTerm: String,
        resources: [String],
        importantLinks: [{
          title: String,
          url: String,
          type: String
        }]
      }]
    }]
  },
  completionStatus: [{
    completed: Boolean,
    topics: [{ completed: Boolean }],
    testAttempted: Boolean,
    testScore: Number,
    testResults: Object,
    assignmentCompleted: Boolean
  }],
  testResults: [{
    chapterIndex: Number,
    chapterTitle: String,
    score: Number,
    totalQuestions: Number,
    correctAnswers: Number,
    incorrectAnswers: Array,
    conceptsToReview: [String],
    difficultyBreakdown: Object,
    answeredQuestions: Array,
    completedAt: String,
    timestamp: { type: Date, default: Date.now }
  }],
  studyTime: { type: Number, default: 0 },
  lastAccessed: { type: Date, default: Date.now },
  studyStreak: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Batch", BatchSchema);