/*
import nodemailer from "nodemailer";

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
}

const transporter = nodemailer.createTransport({
    service: "gmail", // or your provider
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendEmail = async ({ to, subject, html }: EmailOptions) => {
    const mailOptions = {
        from: `"Book Club" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
    };

    await transporter.sendMail(mailOptions);
};
*/
import nodemailer from "nodemailer";

export const sendWelcomeEmail = async (to: string, name: string) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

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
