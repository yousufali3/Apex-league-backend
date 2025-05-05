import nodemailer from 'nodemailer';

export const sendEmail = async (to, subject, text) => {
  const transporter = nodemailer.createTransport({
    service: 'Gmail', // or use Mailtrap/SendGrid in prod
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Free Fire App" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
  });
};
