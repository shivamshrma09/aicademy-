const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/student.middleware');
const resourceController = require('../controllers/resource.controllers');

router.post('/create', authenticateToken, resourceController.createResource);
router.get('/all', authenticateToken, resourceController.getAllResources);
router.delete('/:id', authenticateToken, resourceController.deleteResource);

module.exports = router;
