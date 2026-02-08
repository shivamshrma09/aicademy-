const express = require('express');
const router = express.Router();
const Resource = require('../models/resource.models');
const { TestSeries, TestResult } = require('../models/testSeries.models');
const Batch = require('../models/batch.models');
const Student = require('../models/student.models');
const { authUser } = require('../middlewares/student.middleware');

router.get('/stats', authUser, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const student = await Student.findById(userId);
    const batches = await Batch.find({ userId });
    const resources = await Resource.find({ userId }).sort({ createdAt: -1 });
    const testSeries = await TestSeries.find({ userId });
    const testResults = await TestResult.find({ userId }).sort({ dateCompleted: -1 });
    
    const totalBatches = batches.length;
    const completedBatches = batches.filter(b => b.progress === 100).length;
    const totalTests = testResults.length;
    const avgScore = testResults.length > 0 ? Math.round(testResults.reduce((sum, t) => sum + (t.score / t.totalQuestions * 100), 0) / testResults.length) : 0;
    
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const weeklyActivity = Array(7).fill(0);
    [...batches, ...resources, ...testResults].forEach(item => {
      const date = new Date(item.lastAccessed || item.createdAt || item.dateCompleted);
      if (date >= weekAgo) {
        const dayIndex = Math.floor((now - date) / (24 * 60 * 60 * 1000));
        if (dayIndex < 7) weeklyActivity[6 - dayIndex]++;
      }
    });
    
    const recentBatches = batches.sort((a, b) => new Date(b.lastAccessed) - new Date(a.lastAccessed)).slice(0, 5).map(b => ({
      id: b.id,
      title: b.title,
      subject: b.subject,
      progress: b.progress,
      lastAccessed: b.lastAccessed
    }));
    
    const recentTests = testResults.slice(0, 5).map(t => ({
      testName: t.testName,
      testTitle: t.testTitle,
      score: t.score,
      totalQuestions: t.totalQuestions,
      percentage: Math.round((t.score / t.totalQuestions) * 100),
      date: t.dateCompleted
    }));
    
    const recentResources = resources.slice(0, 5).map(r => ({
      heading: r.heading,
      description: r.description,
      createdAt: r.createdAt
    }));
    
    const activeBatches = batches.filter(b => b.progress > 0 && b.progress < 100).slice(0, 5).map(b => ({
      title: b.title,
      subject: b.subject,
      progress: b.progress,
      completedChapters: b.completedChapters,
      totalChapters: b.totalChapters
    }));
    
    const totalChaptersCompleted = batches.reduce((sum, b) => sum + (b.completedChapters || 0), 0);
    const totalChapters = batches.reduce((sum, b) => sum + (b.totalChapters || 0), 0);
    const totalStudyTime = batches.reduce((sum, b) => sum + (b.studyTime || 0), 0);
    const studyTimeWeek = student.studySessions?.filter(s => new Date(s.date) >= weekAgo).reduce((sum, s) => sum + (s.totalTime || 0), 0) || 0;
    
    const testScores = testResults.slice(0, 7).map(t => Math.round((t.score / t.totalQuestions) * 100));
    
    const subjectPerformance = {};
    batches.forEach(b => {
      if (b.subject && b.testResults?.length > 0) {
        const avgSubjectScore = b.testResults.reduce((sum, t) => sum + (t.score / t.totalQuestions * 100), 0) / b.testResults.length;
        subjectPerformance[b.subject] = (subjectPerformance[b.subject] || []).concat(avgSubjectScore);
      }
    });
    
    const bestSubjects = Object.entries(subjectPerformance).map(([subject, scores]) => ({
      subject,
      avgScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    })).sort((a, b) => b.avgScore - a.avgScore).slice(0, 3);
    
    const studySessions = student.studySessions?.slice(-7).map(s => ({
      date: s.date,
      totalTime: Math.round(s.totalTime / 60000),
      pointsEarned: s.pointsEarned
    })) || [];
    
    res.json({
      success: true,
      stats: {
        overview: {
          totalBatches,
          completedBatches,
          totalTests,
          avgScore,
          streak: student.streak || 0,
          totalPoints: student.totalPoints || 0,
          rank: student.rank || 0
        },
        recentActivity: {
          recentBatches,
          recentTests,
          recentResources,
          studyTimeWeek: Math.round(studyTimeWeek / 60000)
        },
        progress: {
          activeBatches,
          totalChaptersCompleted,
          totalChapters,
          totalStudyTime: Math.round(totalStudyTime / 60)
        },
        testPerformance: {
          testScores,
          totalTests,
          avgScore,
          bestSubjects,
          testCompletionRate: totalBatches > 0 ? Math.round((completedBatches / totalBatches) * 100) : 0
        },
        resources: {
          totalPDFs: resources.length,
          libraryItems: student.libraryItems?.length || 0,
          totalTestSeries: testSeries.length
        },
        achievements: {
          certificates: student.certificates?.length || 0,
          completedBatches: student.numberOfBatchesCompleted || 0
        },
        studySessions,
        weeklyActivity
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
