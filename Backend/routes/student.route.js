const express = require('express');
const router = express.Router();
const { body } = require("express-validator")
const studentcontrollers = require("../controllers/student.controllers");
const authMiddleware = require('../middlewares/student.middleware');
const Student = require('../models/student.models');
const jwt = require('jsonwebtoken');
const blackListTokenModel = require('../models/blackListToken.model');

// Public routes - OTP based authentication

// Step 1: Send OTP for registration
router.post('/send-registration-otp', [
    body('email').isEmail().withMessage('Invalid Email'),
],
    studentcontrollers.sendRegistrationOTP
)

// Step 2: Verify OTP and complete registration
router.post('/register', [
    body('email').isEmail().withMessage('Invalid Email'),
    body('name').isLength({ min: 3 }).withMessage('Name must be at least 3 characters long'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('course').isLength({ min: 3 }).withMessage('Course must be at least 3 characters long'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
],
    studentcontrollers.RegisterStudent
)

// Step 1: Send OTP for login
router.post('/send-login-otp', [
    body('email').isEmail().withMessage('Invalid Email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
],
    studentcontrollers.sendLoginOTP
)

// Step 2: Verify OTP and complete login
router.post('/login', [
    body('email').isEmail().withMessage('Invalid Email'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
],
    studentcontrollers.loginstudent
)

// Logout route
router.post('/logout', authMiddleware.authUser, async (req, res) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
        
        if (token) {
            await blackListTokenModel.create({ token });
        }
        
        res.clearCookie('token');
        res.status(200).json({ 
            success: true,
            message: 'Logged out successfully' 
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Logout failed' 
        });
    }
});

// Get current user (protected route)
router.get('/user', authMiddleware.authUser, async (req, res) => {
    try {
        res.json({ 
            success: true,
            user: {
                _id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                course: req.user.course,
                streak: req.user.streak || 0,
                totalPoints: req.user.totalPoints || 0,
                rank: req.user.rank || 0,
                numberOfBatchesCompleted: req.user.numberOfBatchesCompleted || 0,
                batches: req.user.batches || [],
                libraryItems: req.user.libraryItems || [],
                lastActiveDate: req.user.lastActiveDate
            }
        });
    } catch (error) {
        console.error('Error in /user endpoint:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error' 
        });
    }
});

// Protected routes
router.get('/:id', authMiddleware.authUser, async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found' 
            });
        }
        res.json({ 
            success: true,
            user: student 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false,
            message: 'Server error' 
        });
    }
});

router.post('/add-batch', authMiddleware.authUser, studentcontrollers.addBatchToStudent);   
router.post('/add-library', authMiddleware.authUser, studentcontrollers.addLibraryToStudent);
router.post('/update-study-session', authMiddleware.authUser, studentcontrollers.updateStudySession);
router.get('/user-stats', authMiddleware.authUser, studentcontrollers.getUserWithStats);


module.exports = router;