import nodemailer from "nodemailer";

// Helper function to get transporter with current environment variables
const getTransporter = () => {
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

  if (!user || !pass) {
    throw new Error(
      "SMTP credentials not configured. Please set SMTP_USER and SMTP_PASS (or EMAIL_USER and EMAIL_PASS) in .env file",
    );
  }

  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "Gmail",
    auth: {
      user,
      pass,
    },
  });
};

export const EmailService = {
  async sendMail(to: string, subject: string, html: string) {
    const user = process.env.SMTP_USER || process.env.EMAIL_USER;
    const transporter = getTransporter();

    const info = await transporter.sendMail({
      from: `"O Positive CRM" <${user}>`,
      to,
      subject,
      html,
    });
    return info;
  },

  async sendOtpEmail(email: string, otp: string, userName: string) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #1e40af; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9fafb; padding: 30px; }
          .otp-box { background-color: white; border: 2px dashed #1e40af; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; color: #1e40af; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>O Positive Health CRM</h1>
          </div>
          <div class="content">
            <h2>Hello ${userName},</h2>
            <p>You have requested to login to your account. Please use the following OTP to complete your login:</p>
            <div class="otp-box">${otp}</div>
            <p><strong>This OTP is valid for 10 minutes only.</strong></p>
            <p>If you did not request this OTP, please ignore this email and contact support immediately.</p>
            <p>For security reasons, please do not share this OTP with anyone.</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 O Positive Health. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendMail(email, "Login OTP - O Positive Health CRM", html);
  },
};
