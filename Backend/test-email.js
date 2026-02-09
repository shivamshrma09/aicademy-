const dotenv = require('dotenv');
dotenv.config();

const sgMail = require('@sendgrid/mail');

console.log('=== Email Service Test ===\n');

console.log('SENDGRID_API_KEY exists:', !!process.env.SENDGRID_API_KEY);
console.log('API Key value:', process.env.SENDGRID_API_KEY ? 'Set' : 'Not Set');
console.log('SENDGRID_FROM_EMAIL:', process.env.SENDGRID_FROM_EMAIL);
console.log('');

if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_API_KEY !== 'your_sendgrid_api_key_here') {
  console.log('✅ Setting API Key for SendGrid...');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
  console.log('❌ API Key not properly configured!');
  process.exit(1);
}

// Test sending an email
async function testEmail() {
  console.log('\nAttempting to send test email...\n');
  
  const msg = {
    to: 'test@example.com',
    from: process.env.SENDGRID_FROM_EMAIL,
    subject: 'Test Email from IntelliLearn Backend',
    text: 'This is a test email',
    html: '<strong>This is a test email</strong>'
  };

  try {
    const response = await sgMail.send(msg);
    console.log('✅ Email sent successfully!');
    console.log('Response:', response[0].statusCode);
  } catch (error) {
    console.log('❌ Error sending email:');
    console.log('Error Code:', error.code);
    console.log('Error Message:', error.message);
    if (error.response) {
      console.log('Response Status:', error.response.status);
      console.log('Response Body:', error.response.body);
    }
  }
}

testEmail();
