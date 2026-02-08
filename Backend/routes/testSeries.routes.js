const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/student.middleware');
const testSeriesController = require('../controllers/testSeries.controllers');

router.post('/create', authenticateToken, testSeriesController.createTestSeries);
router.get('/all', authenticateToken, testSeriesController.getAllTestSeries);
router.post('/result', authenticateToken, testSeriesController.saveTestResult);
router.get('/results', authenticateToken, testSeriesController.getTestResults);

module.exports = router;
