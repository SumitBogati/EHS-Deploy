const nodemailer = require('nodemailer');

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'bogatisumit4@gmail.com',
    pass: 'drtk fptk muwj xxwi',
  },
});


// Verification Email
const getVerificationEmailHTML = (code, firstName) => `
<div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; background: #ffffff; border: 1px solid #eaeaea; border-radius: 8px;">
  <header style="text-align: center; margin-bottom: 24px;">
    <img src="https://tinyurl.com/nfb75896" alt="EasyHomeServices" style="width: 240px; height: auto; margin-bottom: 16px;">
    <h2 style="color: #2A5DB0; font-size: 20px; font-weight: 600; margin: 0;">
      Account Verification Required
    </h2>
  </header>

  <main style="color: #444444; line-height: 1.6;">
    <div style="padding: 16px 24px; background: #f8f9fa; border-radius: 6px;">
      <p>Hello, ${firstName}</p>
      <p>Please use the following verification code to complete your registration:</p>
      
      <div style="margin: 24px 0; padding: 12px; background: #ffffff; border: 1px solid #e0e0e0; border-radius: 4px;">
        <div style="font-family: monospace; color: #1A73E8; font-size: 32px; font-weight: 700; letter-spacing: 2px;">
          ${code}
        </div>
      </div>

      <p>If you didn't request this, please disregard this message.</p>
    </div>
  </main>

  <footer style="margin-top: 24px; font-size: 12px; color: #666666; text-align: center;">
    <p style="margin: 4px 0;">© 2025 EasyHomeServices</p>
    <p style="margin: 4px 0;">All rights reserved</p>
  </footer>
</div>
`;

// Welcome Email
const getWelcomeEmailHTML = (firstName) => `
<div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; background: #ffffff; border: 1px solid #eaeaea; border-radius: 8px;">
  <header style="text-align: center; margin-bottom: 24px;">
    <img src="https://tinyurl.com/nfb75896" alt="EasyHomeServices" style="width: 240px; height: auto; margin-bottom: 16px;">
    <h2 style="color: #2A5DB0; font-size: 20px; font-weight: 600; margin: 0;">
      Welcome to EasyHomeServices, ${firstName}!
    </h2>
  </header>

  <main style="color: #444444; line-height: 1.6;">
    <div style="padding: 16px 24px; background: #f8f9fa; border-radius: 6px;">
      <p>Thank you for joining EasyHomeServices!</p>
      <p>We're pleased to welcome you to our platform, where you can effortlessly book quality home services with just a few clicks.</p>
      <p>Should you need any assistance, our support team is always ready to help.</p>
    </div>
  </main>

  <footer style="margin-top: 24px; font-size: 12px; color: #666666; text-align: center;">
    <p style="margin: 4px 0;">This is an automated message · © 2025 EasyHomeServices</p>
    <p style="margin: 4px 0;">All rights reserved</p>
  </footer>
</div>
`;

const getBookingConfirmationEmailHTML = (firstName, service, staff, date, timeSlot) => `
<div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; background: #ffffff; border: 1px solid #eaeaea; border-radius: 8px;">
  <header style="text-align: center; margin-bottom: 24px;">
    <img src="https://tinyurl.com/nfb75896" alt="EasyHomeServices" style="width: 240px; height: auto; margin-bottom: 16px;">
    <h2 style="color: #2A5DB0; font-size: 20px; font-weight: 600; margin: 0;">
      Booking Confirmed ✅
    </h2>
  </header>

  <main style="color: #444444; line-height: 1.6;">
    <div style="padding: 16px 24px; background: #f8f9fa; border-radius: 6px;">
      <p>Hi ${firstName},</p>
      <p>Your booking has been confirmed. Here are the details:</p>

      <h3 style="margin: 16px 0 8px;">🛠️ Service Details</h3>
      <ul style="list-style: none; padding-left: 0;">
        <li><strong>Service:</strong> ${service.name}</li>
        <li><strong>Price:</strong> NPR ${service.price}</li>
        <li><strong>Date:</strong> ${date}</li>
        <li><strong>Time Slot:</strong> ${timeSlot}</li>
      </ul>

      <h3 style="margin: 16px 0 8px;">👤 Assigned Staff</h3>
      <div style="display: flex; align-items: center; gap: 12px;">
        <div>
          <p style="margin: 4px 0;"><strong>Name:</strong> ${staff.name}</p>
          <p style="margin: 4px 0;"><strong>Phone:</strong> ${staff.phone}</p>
        </div>
      </div>

      <p style="margin-top: 16px; font-size: 14px; color: #555;">
        You can view the full staff profile by clicking on your booking card from the My Booking section.
      </p>
    </div>
  </main>

  <footer style="margin-top: 24px; font-size: 12px; color: #666666; text-align: center;">
    <p style="margin: 4px 0;">© 2025 EasyHomeServices</p>
    <p style="margin: 4px 0;">All rights reserved</p>
  </footer>
</div>
`;

// Reschedule Notification Email
const getRescheduleNotificationEmailHTML = (firstName, serviceName, newDate, newSlot) => `
<div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; background: #fff; border: 1px solid #eaeaea; border-radius: 8px;">
  <header style="text-align: center; margin-bottom: 24px;">
    <img src="https://tinyurl.com/nfb75896" alt="EasyHomeServices" style="width: 240px; height: auto;">
  </header>

  <main style="color: #444444; line-height: 1.6;">
    <h2 style="color: #2A5DB0; font-size: 20px; font-weight: 600; text-align: center; margin: 0 0 24px 0;">
      Important Booking Reschedule Notification
    </h2>

    <div style="padding: 16px 24px; background: #f8f9fa; border-radius: 6px;">
      <p>Hi ${firstName},</p>
      <p>Your <strong>${serviceName}</strong> appointment has been rescheduled due to a scheduling conflict.</p>
      
      <div style="margin: 20px 0; color: #2A5DB0; font-weight: 500;">
        <p style="margin: 8px 0;">New appointment details:</p>
        <p style="margin: 0;">📅 ${newDate} | 🕒 ${newSlot}</p>
      </div>

      <p>We sincerely apologize for any inconvenience this may cause. For assistance, please contact our support team.</p>
    </div>
  </main>

  <footer style="margin-top: 24px; font-size: 12px; color: #666666; text-align: center;">
    <p style="margin: 0;">© 2025 EasyHomeServices. All rights reserved.</p>
  </footer>
</div>
`;

// Service Completion Email
const getCompletionEmailHTML = (firstName, serviceName, date, timeSlot) => `
<div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; background: #ffffff; border: 1px solid #eaeaea; border-radius: 8px;">
  <header style="text-align: center; margin-bottom: 24px;">
    <img src="https://tinyurl.com/nfb75896" alt="EasyHomeServices" style="width: 240px; height: auto; margin-bottom: 16px;">
  </header>

  <main style="color: #444444; line-height: 1.6;">
    <div style="padding: 16px 24px; background: #f8f9fa; border-radius: 6px;">
      <h2 style="color: #2A5DB0; font-size: 20px; font-weight: 600; margin: 0 0 16px 0; text-align: center;">
        Service Completed ✅
      </h2>
      <p>Hi ${firstName},</p>
      <p>Your <strong>${serviceName}</strong> service has been successfully completed.</p>
      
      <div style="margin: 20px 0; padding: 12px; background: #fff; border-radius: 4px;">
        <p style="margin: 4px 0;">📅 ${date}</p>
        <p style="margin: 4px 0;">🕒 ${timeSlot}</p>
      </div>

      <p>Thank you for choosing EasyHomeServices! We value your trust and would love to hear your feedback.</p>
    </div>
  </main>

  <footer style="margin-top: 24px; font-size: 12px; color: #666666; text-align: center;">
    <p style="margin: 0;">© 2025 EasyHomeServices. All rights reserved.</p>
  </footer>
</div>
`;

// Service Cancelled Email
const getCancellationEmailHTML = (firstName, serviceName, date, timeSlot) => `
<div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; background: #ffffff; border: 1px solid #eaeaea; border-radius: 8px;">
  <header style="text-align: center; margin-bottom: 24px;">
    <img src="https://tinyurl.com/nfb75896" alt="EasyHomeServices" style="width: 240px; height: auto; margin-bottom: 16px;">
  </header>

  <main style="color: #444444; line-height: 1.6;">
    <div style="padding: 16px 24px; background: #f8f9fa; border-radius: 6px;">
      <h2 style="color: #D9534F; font-size: 20px; font-weight: 600; margin: 0 0 16px 0; text-align: center;">
        Service Cancellation Notice ❌
      </h2>
      
      <p>Dear ${firstName},</p>
      <p>We regret to inform you that your <strong>${serviceName}</strong> appointment has been cancelled.</p>
      
      <div style="margin: 20px 0; padding: 12px; background: #fff; border-radius: 4px;">
        <p style="margin: 4px 0;">📅 ${date}</p>
        <p style="margin: 4px 0;">🕒 ${timeSlot}</p>
      </div>

      <div style="margin: 24px 0; padding: 16px; background: #fff3f3; border-left: 4px solid #D9534F;">
        <h3 style="color: #D9534F; font-size: 16px; margin: 0 0 12px 0;">Payment Information</h3>
        <p style="margin: 8px 0;">
          If payment was processed for this appointment, please note:
        </p>
        <ul style="margin: 12px 0; padding-left: 20px;">
          <li>Full amount will be refunded to original payment method</li>
          <li>Payment will be returned within 2-3 business days</li>
        </ul>
        <p style="margin: 12px 0 0 0; font-weight: 500;">
          ⚠️ If refund delays occur beyond 3 business days, please contact us immediately.
        </p>
      </div>

      <p style="margin: 16px 0;">
        We sincerely apologize for any inconvenience caused. For assistance or to reschedule, 
        please contact our support team at <a href="mailto:support@easyhomeservices.com" style="color: #2A5DB0; text-decoration: none;">support@easyhomeservices.com</a> 
        or call us at 9876543210.
      </p>
    </div>
  </main>

  <footer style="margin-top: 24px; font-size: 12px; color: #666666; text-align: center;">
    <p style="margin: 0;">© 2025 EasyHomeServices. All rights reserved.</p>
  </footer>
</div>
`;

// Verification Code Email
const sendVerificationCode = async (email, code, firstName) => {
  const mailOptions = {
    from: '"EasyHomeServices" <bogatisumit4@gmail.com>',
    to: email,
    subject: 'Your Verification Code - EasyHomeServices',
    html: getVerificationEmailHTML(code, firstName),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error('Error sending verification email:', error);
  }
};

// Welcome Email
const sendWelcomeEmail = async (email, firstName) => {
  const mailOptions = {
    from: '"EasyHomeServices" <bogatisumit4@gmail.com>',
    to: email,
    subject: 'Welcome to EasyHomeServices!',
    html: getWelcomeEmailHTML(firstName),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${email}`);
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
};

const sendBookingConfirmationEmail = async (email, firstName, service, staff, date, timeSlot) => {
  const mailOptions = {
    from: '"EasyHomeServices" <bogatisumit4@gmail.com>',
    to: email,
    subject: 'Booking Confirmation - EasyHomeServices',
    html: getBookingConfirmationEmailHTML(firstName, service, staff, date, timeSlot),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Booking confirmation sent to ${email}`);
  } catch (error) {
    console.error('Error sending booking confirmation email:', error);
  }
};

// Email sending functions
const sendCompletionEmail = async (email, firstName, serviceName, date, timeSlot) => {
  const mailOptions = {
    from: '"EasyHomeServices" <bogatisumit4@gmail.com>',
    to: email,
    subject: 'Service Completed - EasyHomeServices',
    html: getCompletionEmailHTML(firstName, serviceName, date, timeSlot),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Completion email sent to ${email}`);
  } catch (error) {
    console.error('Error sending completion email:', error);
  }
};

const sendCancellationEmail = async (email, firstName, serviceName, date, timeSlot) => {
  const mailOptions = {
    from: '"EasyHomeServices" <bogatisumit4@gmail.com>',
    to: email,
    subject: 'Service Cancelled - EasyHomeServices',
    html: getCancellationEmailHTML(firstName, serviceName, date, timeSlot),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Cancellation email sent to ${email}`);
  } catch (error) {
    console.error('Error sending cancellation email:', error);
  }
};

// Send Reschedule Notification
const sendRescheduleNotification = async (email, firstName, serviceName, newDate, newSlot) => {
  // Validate inputs
  if (!email) {
    console.error('Cannot send reschedule email: No email provided');
    return false;
  }
  if (!newDate || !newSlot) {
    console.error(`Cannot send reschedule email to ${email}: Missing date or slot`);
    return false;
  }

  const mailOptions = {
    from: '"EasyHomeServices" <bogatisumit4@gmail.com>',
    to: email,
    subject: 'Booking Rescheduled - EasyHomeServices',
    html: getRescheduleNotificationEmailHTML(
      firstName || 'User',
      serviceName || 'your service',
      newDate,
      newSlot
    ),
  };

  try {
    console.log(`Attempting to send reschedule email to ${email}`);
    await transporter.sendMail(mailOptions);
    console.log(`Reschedule notification sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error(`Error sending reschedule email to ${email}:`, error.message);
    return false;
  }
};

module.exports = {
  sendVerificationCode,
  sendWelcomeEmail,
  sendBookingConfirmationEmail,
  sendRescheduleNotification,
  sendCompletionEmail,
  sendCancellationEmail,
};