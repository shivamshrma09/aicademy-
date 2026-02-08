const sgMail = require('@sendgrid/mail');

// Initialize SendGrid only if API key exists
if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_API_KEY !== 'your_sendgrid_api_key_here') {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const emailService = {
  // Send OTP email
  sendOTP: async (email, otp, type) => {
    // Development mode - just log OTP to console
    if (!process.env.SENDGRID_API_KEY || process.env.SENDGRID_API_KEY === 'your_sendgrid_api_key_here') {
      console.log('\n=================================');
      console.log('📧 OTP EMAIL (Development Mode)');
      console.log('=================================');
      console.log(`To: ${email}`);
      console.log(`Type: ${type}`);
      console.log(`OTP: ${otp}`);
      console.log(`Valid for: 10 minutes`);
      console.log('=================================\n');
      return { success: true };
    }
    const subject = type === 'registration' 
      ? 'Verify Your Email - IntelliLearn'
      : type === 'login'
      ? 'Your Login OTP - IntelliLearn'
      : 'Reset Your Password - IntelliLearn';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .otp-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
          .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎓 IntelliLearn</h1>
            <p>AI-Powered Learning Platform</p>
          </div>
          <div class="content">
            <h2>Hello!</h2>
            <p>Your One-Time Password (OTP) for ${type === 'registration' ? 'email verification' : type === 'login' ? 'login' : 'password reset'} is:</p>
            
            <div class="otp-box">
              <div class="otp-code">${otp}</div>
            </div>
            
            <p><strong>This OTP is valid for 10 minutes.</strong></p>
            
            <div class="warning">
              ⚠️ <strong>Security Notice:</strong> Never share this OTP with anyone. IntelliLearn will never ask for your OTP via phone or email.
            </div>
            
            <p>If you didn't request this OTP, please ignore this email or contact our support team.</p>
            
            <p>Best regards,<br><strong>IntelliLearn Team</strong></p>
          </div>
          <div class="footer">
            <p>© 2025 IntelliLearn. All rights reserved.</p>
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const msg = {
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@intellilearn.com',
      subject: subject,
      html: html,
    };

    try {
      await sgMail.send(msg);
      console.log(`OTP email sent to ${email}`);
      return { success: true };
    } catch (error) {
      console.error('SendGrid Error:', error);
      if (error.response) {
        console.error('SendGrid Response:', error.response.body);
      }
      throw new Error('Failed to send OTP email');
    }
  },

  // Send welcome email after successful registration
  sendWelcomeEmail: async (email, name) => {
    // Skip in development mode
    if (!process.env.SENDGRID_API_KEY || process.env.SENDGRID_API_KEY === 'your_sendgrid_api_key_here') {
      console.log(`✅ Welcome email skipped (dev mode) for: ${name} <${email}>`);
      return;
    }
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .features { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .feature-item { margin: 10px 0; padding-left: 25px; position: relative; }
          .feature-item:before { content: "✓"; position: absolute; left: 0; color: #667eea; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to IntelliLearn!</h1>
          </div>
          <div class="content">
            <h2>Hi ${name}!</h2>
            <p>Welcome to IntelliLearn - Your AI-powered learning companion! We're excited to have you on board.</p>
            
            <div class="features">
              <h3>What you can do with IntelliLearn:</h3>
              <div class="feature-item">Create and manage personalized learning batches</div>
              <div class="feature-item">Access AI-powered study materials</div>
              <div class="feature-item">Track your learning progress with analytics</div>
              <div class="feature-item">Build your personal library of resources</div>
              <div class="feature-item">Discover career opportunities</div>
            </div>
            
            <p style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" class="button">Start Learning Now</a>
            </p>
            
            <p>If you have any questions, feel free to reach out to our support team.</p>
            
            <p>Happy Learning!<br><strong>IntelliLearn Team</strong></p>
          </div>
        </div>
      </body>
      </html>
    `;

    const msg = {
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@intellilearn.com',
      subject: 'Welcome to IntelliLearn! 🎓',
      html: html,
    };

    try {
      await sgMail.send(msg);
      console.log(`Welcome email sent to ${email}`);
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      // Don't throw error for welcome email failure
    }
  },

  // Send test report email
  sendTestReportEmail: async (email, testData) => {
    if (!process.env.SENDGRID_API_KEY || process.env.SENDGRID_API_KEY === 'your_sendgrid_api_key_here') {
      console.log('\n=================================');
      console.log('📧 TEST REPORT EMAIL (Development Mode)');
      console.log('=================================');
      console.log(`To: ${email}`);
      console.log(`Student: ${testData.studentName}`);
      console.log(`Test: ${testData.testName} - ${testData.testTitle}`);
      console.log(`Score: ${testData.score}/${testData.totalQuestions} (${testData.percentage}%)`);
      console.log(`Level: ${testData.level}`);
      console.log('=================================\n');
      return { success: true };
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #174C7C 0%, #0d3a5c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .score-box { background: white; border: 2px solid #174C7C; padding: 25px; text-align: center; margin: 20px 0; border-radius: 8px; }
          .score { font-size: 48px; font-weight: bold; color: #174C7C; }
          .percentage { font-size: 24px; color: #666; margin-top: 10px; }
          .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎓 Test Report</h1>
            <p>IntelliLearn Test Series</p>
          </div>
          <div class="content">
            <h2>Hi ${testData.studentName}!</h2>
            <p>Congratulations on completing your test! Here's your detailed report:</p>
            
            <div class="score-box">
              <div class="score">${testData.score}/${testData.totalQuestions}</div>
              <div class="percentage">${testData.percentage}% Score</div>
            </div>
            
            <div class="details">
              <div class="detail-row">
                <strong>Test Series:</strong>
                <span>${testData.testName}</span>
              </div>
              <div class="detail-row">
                <strong>Test:</strong>
                <span>${testData.testTitle}</span>
              </div>
              <div class="detail-row">
                <strong>Level:</strong>
                <span>${testData.level}</span>
              </div>
              <div class="detail-row">
                <strong>Total Questions:</strong>
                <span>${testData.totalQuestions}</span>
              </div>
              <div class="detail-row">
                <strong>Correct Answers:</strong>
                <span>${testData.score}</span>
              </div>
            </div>
            
            <p>${testData.percentage >= 70 ? '🎉 Great job! Keep up the excellent work!' : '💪 Keep practicing! You\'re making progress!'}</p>
            
            <p>Best regards,<br><strong>IntelliLearn Team</strong></p>
          </div>
          <div class="footer">
            <p>© 2025 IntelliLearn. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const msg = {
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@intellilearn.com',
      subject: `Test Report: ${testData.testTitle} - ${testData.percentage}% Score`,
      html: html,
    };

    try {
      await sgMail.send(msg);
      console.log(`Test report email sent to ${email}`);
      return { success: true };
    } catch (error) {
      console.error('Failed to send test report email:', error);
      throw new Error('Failed to send test report email');
    }
  }
};

module.exports = emailService;
