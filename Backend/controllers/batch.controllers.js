const Batch = require('../models/batch.models');
const jwt = require('jsonwebtoken');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
if (!process.env.GOOGLE_API_KEY) {
  throw new Error('GOOGLE_API_KEY is required in environment variables');
}
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Get all batches for user
exports.getBatches = async (req, res) => {
  try {
    if (!req.headers.authorization) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    let userId = null;
    try {
      const token = req.headers.authorization.replace('Bearer ', '');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.id || decoded._id;
    } catch (tokenError) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }
    
    const batches = await Batch.find({ userId }).sort({ createdAt: -1 });
    res.json({ success: true, batches });
  } catch (error) {
    console.error('Error fetching batches:', error);
    res.status(500).json({ success: false, message: 'Error fetching batches' });
  }
};

// Get batch by ID
exports.getBatchById = async (req, res) => {
  try {
    const batch = await Batch.findOne({ id: req.params.id, userId: req.user._id });
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }
    res.json(batch);
  } catch (error) {
    console.error('Error fetching batch:', error);
    res.status(500).json({ message: 'Error fetching batch', error: error.message });
  }
};

// Create new batch (with full content)
exports.createBatch = async (req, res) => {
  try {
    if (!req.headers.authorization) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    let userId = null;
    try {
      const token = req.headers.authorization.replace('Bearer ', '');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.id || decoded._id;
    } catch (tokenError) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }
    
    const batchData = {
      id: req.body.id || `batch-${Date.now()}`,
      userId,
      title: req.body.title,
      subject: req.body.subject,
      difficulty: req.body.difficulty,
      language: req.body.language,
      estimatedTime: req.body.estimatedTime,
      instructor: req.body.instructor,
      image: req.body.image,
      description: req.body.description,
      totalChapters: req.body.totalChapters,
      type: req.body.type,
      aiLearningPlan: req.body.aiLearningPlan,
      completionStatus: req.body.completionStatus || [],
      progress: 0,
      completedChapters: 0,
      enrolledStudents: 1,
      createdAt: new Date()
    };
    
    const batch = new Batch(batchData);
    const savedBatch = await batch.save();
    
    res.status(201).json({ success: true, batch: savedBatch });
  } catch (error) {
    console.error('Error creating batch:', error);
    res.status(500).json({ success: false, message: 'Error creating batch', error: error.message });
  }
};

// Update batch progress
exports.updateBatchProgress = async (req, res) => {
  try {
    const { progress, completedChapters } = req.body;
    const batch = await Batch.findOneAndUpdate(
      { id: req.params.id, userId: req.user._id },
      { progress, completedChapters },
      { new: true }
    );
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }
    res.json(batch);
  } catch (error) {
    console.error('Error updating batch progress:', error);
    res.status(500).json({ message: 'Error updating batch progress', error: error.message });
  }
};

// Update chapter progress
exports.updateChapterProgress = async (req, res) => {
  try {
    const { progress, completed } = req.body;
    const batch = await Batch.findOne({ id: req.params.id, userId: req.user._id });
    
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }
    
    // Update chapter progress in aiLearningPlan
    if (batch.aiLearningPlan && batch.aiLearningPlan.chapters) {
      const chapterIndex = batch.aiLearningPlan.chapters.findIndex(
        ch => ch.id === req.params.chapterId
      );
      
      if (chapterIndex !== -1) {
        batch.aiLearningPlan.chapters[chapterIndex].progress = progress;
        batch.aiLearningPlan.chapters[chapterIndex].completed = completed;
      }
    }
    
    await batch.save();
    res.json(batch);
  } catch (error) {
    console.error('Error updating chapter progress:', error);
    res.status(500).json({ message: 'Error updating chapter progress', error: error.message });
  }
};

// Save test results
exports.saveTestResults = async (req, res) => {
  try {
    const { chapterIndex, chapterTitle, batchTitle, testResults } = req.body;
    
    // Get user from token
    let userId = null;
    let userEmail = null;
    let userName = null;
    
    try {
      const token = req.headers.authorization.replace('Bearer ', '');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.id || decoded._id;
      
      // Fetch user details
      const Student = require('../models/student.models');
      const user = await Student.findById(userId);
      if (user) {
        userEmail = user.email;
        userName = user.name;
      }
    } catch (tokenError) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    
    const batch = await Batch.findOne({ id: req.params.id, userId });
    
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }
    
    // Initialize testResults array if not exists
    if (!batch.testResults) {
      batch.testResults = [];
    }
    
    // Save test results to database
    batch.testResults.push({
      chapterIndex,
      chapterTitle,
      score: testResults.score,
      totalQuestions: testResults.totalQuestions,
      correctAnswers: testResults.correctAnswers,
      incorrectAnswers: testResults.incorrectAnswers,
      conceptsToReview: testResults.conceptsToReview,
      difficultyBreakdown: testResults.difficultyBreakdown,
      answeredQuestions: testResults.answeredQuestions,
      completedAt: testResults.completedAt,
      timestamp: new Date()
    });
    
    await batch.save();
    console.log('Test results saved to database successfully');
    
    // Send email report via SendGrid
    let emailSent = false;
    if (userEmail) {
      try {
        const sgMail = require('@sendgrid/mail');
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        
        const msg = {
          to: userEmail,
          from: process.env.SENDGRID_FROM_EMAIL || 'noreply@intellilearn.com',
          subject: `Test Report: ${chapterTitle} - ${batchTitle}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #174C7C;">Test Results Report</h2>
              <p>Hi ${userName || 'Student'},</p>
              <p>You have completed the test for <strong>${chapterTitle}</strong> in <strong>${batchTitle}</strong>.</p>
              
              <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #174C7C; margin-top: 0;">Your Score: ${testResults.score}%</h3>
                <p><strong>Total Questions:</strong> ${testResults.totalQuestions}</p>
                <p><strong>Correct Answers:</strong> ${testResults.correctAnswers}</p>
                <p><strong>Incorrect Answers:</strong> ${testResults.incorrectAnswers.length}</p>
              </div>
              
              ${testResults.conceptsToReview.length > 0 ? `
                <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <h4 style="margin-top: 0;">Concepts to Review:</h4>
                  <ul>
                    ${testResults.conceptsToReview.map(c => `<li>${c}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}
              
              <p>Keep up the great work! Continue learning and improving.</p>
              <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">This is an automated email from IntelliLearn.</p>
            </div>
          `
        };
        
        await sgMail.send(msg);
        emailSent = true;
        console.log('Email sent successfully to:', userEmail);
      } catch (emailError) {
        console.error('Error sending email:', emailError.response?.body || emailError.message);
      }
    }
    
    res.json({ success: true, batch, emailSent, message: 'Test results saved successfully' });
  } catch (error) {
    console.error('Error saving test results:', error);
    res.status(500).json({ success: false, message: 'Error saving test results', error: error.message });
  }
};

// Save notes
exports.saveNotes = async (req, res) => {
  try {
    const { notes } = req.body;
    const batch = await Batch.findOneAndUpdate(
      { id: req.params.id, userId: req.user._id },
      { notes },
      { new: true }
    );
    
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }
    
    res.json(batch);
  } catch (error) {
    console.error('Error saving notes:', error);
    res.status(500).json({ message: 'Error saving notes', error: error.message });
  }
};

// Get user analytics
exports.getUserAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const batches = await Batch.find({ userId });
    
    const analytics = {
      totalBatches: batches.length,
      completedBatches: batches.filter(b => b.progress === 100).length,
      averageProgress: batches.reduce((sum, b) => sum + (b.progress || 0), 0) / batches.length || 0,
      studyStreak: 7, // Mock data - implement actual streak calculation
      weeklyStudyTime: 25, // Mock data - implement actual time tracking
      achievements: [
        { id: 1, name: 'First Batch', description: 'Created your first batch', earned: true },
        { id: 2, name: 'Quick Learner', description: 'Completed a batch in under a week', earned: false }
      ]
    };
    
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Error fetching analytics', error: error.message });
  }
};

// Get leaderboard
exports.getLeaderboard = async (req, res) => {
  try {
    // Mock leaderboard data - implement actual leaderboard logic
    const leaderboard = [
      { rank: 1, username: 'Student A', studyTime: 45, points: 950 },
      { rank: 2, username: 'Student B', studyTime: 38, points: 820 },
      { rank: 3, username: 'Student C', studyTime: 32, points: 750 },
      { rank: 4, username: 'Student D', studyTime: 28, points: 680 },
      { rank: 5, username: 'Student E', studyTime: 25, points: 620 }
    ];
    
    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ message: 'Error fetching leaderboard', error: error.message });
  }
};

// Join study group
exports.joinStudyGroup = async (req, res) => {
  try {
    const { batchId } = req.params;
    const userId = req.user._id;
    
    // Mock study group functionality
    const studyGroup = {
      id: `group_${batchId}`,
      batchId,
      members: [
        { id: userId, name: 'You', joinedAt: new Date() },
        { id: 'user2', name: 'Student B', joinedAt: new Date(Date.now() - 86400000) },
        { id: 'user3', name: 'Student C', joinedAt: new Date(Date.now() - 172800000) }
      ],
      activeDiscussions: 3,
      lastActivity: new Date()
    };
    
    res.json({ message: 'Joined study group successfully', studyGroup });
  } catch (error) {
    console.error('Error joining study group:', error);
    res.status(500).json({ message: 'Error joining study group', error: error.message });
  }
};