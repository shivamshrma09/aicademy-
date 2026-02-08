const { TestSeries, TestResult } = require('../models/testSeries.models');
const Student = require('../models/student.models');
const emailService = require('../services/email.service');

exports.createTestSeries = async (req, res) => {
  try {
    const userId = req.student.id;
    const testSeriesData = req.body;

    const testSeries = new TestSeries({
      userId,
      ...testSeriesData
    });

    await testSeries.save();

    res.status(201).json({
      success: true,
      message: 'Test series created successfully',
      testSeries
    });
  } catch (error) {
    console.error('Error creating test series:', error);
    res.status(500).json({ success: false, message: 'Failed to create test series' });
  }
};

exports.getAllTestSeries = async (req, res) => {
  try {
    const userId = req.student.id;
    const testSeries = await TestSeries.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      testSeries
    });
  } catch (error) {
    console.error('Error fetching test series:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch test series' });
  }
};

exports.saveTestResult = async (req, res) => {
  try {
    const userId = req.student.id;
    const { testSeriesId, testName, testTitle, level, score, totalQuestions } = req.body;

    const testResult = new TestResult({
      userId,
      testSeriesId,
      testName,
      testTitle,
      level,
      score,
      totalQuestions
    });

    await testResult.save();

    const student = await Student.findById(userId);
    
    if (student && student.email) {
      const percentage = Math.round((score / totalQuestions) * 100);
      await emailService.sendTestReportEmail(student.email, {
        studentName: student.name,
        testName,
        testTitle,
        score,
        totalQuestions,
        percentage,
        level
      });
    }

    res.status(201).json({
      success: true,
      message: 'Test result saved successfully',
      testResult,
      emailSent: true
    });
  } catch (error) {
    console.error('Error saving test result:', error);
    res.status(500).json({ success: false, message: 'Failed to save test result' });
  }
};

exports.getTestResults = async (req, res) => {
  try {
    const userId = req.student.id;
    const testResults = await TestResult.find({ userId })
      .populate('testSeriesId', 'Testname subject')
      .sort({ dateCompleted: -1 });

    res.status(200).json({
      success: true,
      testResults
    });
  } catch (error) {
    console.error('Error fetching test results:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch test results' });
  }
};
