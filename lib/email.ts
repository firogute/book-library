import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async ({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) => {
  try {
    console.log(to, subject);
    const info = await transporter.sendMail({
      from: `"Firomsa Guteta" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log(info);

    console.log("✅ Email sent:", info.messageId);
  } catch (error) {
    console.error("❌ Email send failed:", error);
  }
};
