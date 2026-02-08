const OTP = require('../models/otp.model');
const emailService = require('./email.service');

const otpService = {
  // Generate 6-digit OTP
  generateOTP: () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  },

  // Create and send OTP
  createAndSendOTP: async (email, type) => {
    try {
      // Delete any existing OTPs for this email and type
      await OTP.deleteMany({ email: email.toLowerCase(), type });

      // Generate new OTP
      const otp = otpService.generateOTP();

      // Save OTP to database
      const otpDoc = await OTP.create({
        email: email.toLowerCase(),
        otp,
        type,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
      });

      // Send OTP via email
      await emailService.sendOTP(email, otp, type);

      return {
        success: true,
        message: 'OTP sent successfully to your email',
        expiresIn: 600 // seconds
      };
    } catch (error) {
      console.error('Error creating/sending OTP:', error);
      throw error;
    }
  },

  // Verify OTP
  verifyOTP: async (email, otp, type) => {
    try {
      const otpDoc = await OTP.findOne({
        email: email.toLowerCase(),
        otp,
        type,
        verified: false,
        expiresAt: { $gt: new Date() }
      });

      if (!otpDoc) {
        return {
          success: false,
          message: 'Invalid or expired OTP'
        };
      }

      // Mark OTP as verified
      otpDoc.verified = true;
      await otpDoc.save();

      // Delete the OTP after verification
      await OTP.deleteOne({ _id: otpDoc._id });

      return {
        success: true,
        message: 'OTP verified successfully'
      };
    } catch (error) {
      console.error('Error verifying OTP:', error);
      throw error;
    }
  },

  // Check if OTP exists and is valid
  isOTPValid: async (email, type) => {
    const otpDoc = await OTP.findOne({
      email: email.toLowerCase(),
      type,
      verified: false,
      expiresAt: { $gt: new Date() }
    });

    return !!otpDoc;
  }
};

module.exports = otpService;
