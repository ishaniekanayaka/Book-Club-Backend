// utils/sendEmail.ts
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendWelcomeEmail = async (to: string, name: string) => {
    const mailOptions = {
        from: `"Book Club" <${process.env.EMAIL_USER}>`,
        to,
        subject: "Welcome to the Book Club 📚",
        html: `<p>Dear ${name},</p>
               <p>Welcome to our Book Club! We're excited to have you as a member.</p>
               <p>Happy reading!<br/>– The Book Club Team</p>`,
    };
    await transporter.sendMail(mailOptions);
};

export const sendOverdueEmail = async (to: string, name: string, bookTitle: string, dueDate: Date) => {
    const formattedDate = dueDate.toLocaleDateString();
    const mailOptions = {
        from: `"Book Club" <${process.env.EMAIL_USER}>`,
        to,
        subject: "⏰ Overdue Book Reminder",
        html: `<p>Dear ${name},</p>
               <p>This is a friendly reminder that the book <strong>${bookTitle}</strong> you borrowed was due on <strong>${formattedDate}</strong>.</p>
               <p>Please return it as soon as possible to avoid further fines.</p>
               <p>Thank you,<br/>– The Book Club Team</p>`,
    };
    await transporter.sendMail(mailOptions);
};


export const sendOtpEmail = async (to: string, otp: string) => {
    const mailOptions = {
        from: `"Book Club" <${process.env.EMAIL_USER}>`,
        to,
        subject: "Reset Password - OTP Verification",
        html: `<p>Your OTP for resetting the password is:</p>
               <h2>${otp}</h2>
               <p>This OTP is valid for 10 minutes only.</p>`,
    };
    await transporter.sendMail(mailOptions);
};

