import nodemailer from 'nodemailer';

// Create transporter (using Gmail SMTP)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

export const emailService = {
  // Send booking confirmation
  async sendBookingConfirmation(userEmail, userName, bookingDetails) {
    const mailOptions = {
      from: '"Car Rental System" <your-email@gmail.com>',
      to: userEmail,
      subject: 'Booking Confirmation - Car Rental',
      html: `
        <h2>Hello ${userName},</h2>
        <p>Your car booking has been confirmed!</p>
        
        <h3>Booking Details:</h3>
        <ul>
          <li><strong>Car:</strong> ${bookingDetails.make} ${bookingDetails.model}</li>
          <li><strong>Start Date:</strong> ${bookingDetails.startDate}</li>
          <li><strong>End Date:</strong> ${bookingDetails.endDate}</li>
          <li><strong>Pickup Location:</strong> ${bookingDetails.pickupLocation}</li>
          <li><strong>Total Price:</strong> $${bookingDetails.totalPrice}</li>
        </ul>
        
        <p>Thank you for choosing our service!</p>
      `
    };

    return transporter.sendMail(mailOptions);
  },

  // Send payment confirmation
  async sendPaymentConfirmation(userEmail, userName, paymentDetails) {
    const mailOptions = {
      from: '"Car Rental System" <your-email@gmail.com>',
      to: userEmail,
      subject: 'Payment Received - Car Rental',
      html: `
        <h2>Hello ${userName},</h2>
        <p>Your payment has been received successfully!</p>
        
        <h3>Payment Details:</h3>
        <ul>
          <li><strong>Amount:</strong> $${paymentDetails.amount}</li>
          <li><strong>Transaction ID:</strong> ${paymentDetails.transactionId}</li>
          <li><strong>Date:</strong> ${new Date().toLocaleDateString()}</li>
        </ul>
        
        <p>Your booking is now confirmed. Enjoy your ride!</p>
      `
    };

    return transporter.sendMail(mailOptions);
  },

  // Send welcome email
  async sendWelcomeEmail(userEmail, userName) {
    const mailOptions = {
      from: '"Car Rental System" <your-email@gmail.com>',
      to: userEmail,
      subject: 'Welcome to Car Rental System',
      html: `
        <h2>Welcome ${userName}!</h2>
        <p>Thank you for registering with our Car Rental System.</p>
        <p>You can now browse and book cars easily.</p>
        <p>Happy driving!</p>
      `
    };

    return transporter.sendMail(mailOptions);
  }
};