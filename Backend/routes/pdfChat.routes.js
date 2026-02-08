const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authenticateToken } = require('../middlewares/student.middleware');
const pdfChatController = require('../controllers/pdfChat.controllers');

const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

router.post('/extract', authenticateToken, upload.single('pdf'), pdfChatController.extractPdfText);
router.post('/chat', authenticateToken, pdfChatController.chatWithPdf);

module.exports = router;
