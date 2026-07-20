import nodemailer from "nodemailer";
import { ApiError } from "../utils/ApiError.js";

const getTransporter = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } =
    process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: SMTP_SECURE === "true",
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    connectionTimeout: 10000, // 10 seconds to connect
    greetingTimeout: 10000, // 10 seconds for SMTP greeting
    socketTimeout: 10000, // 10 seconds for general socket inactivity
  });
};

export const sendOtpEmail = async ({ to, subject, otp, purpose }) => {
  const transporter = getTransporter();
  const from = process.env.MAIL_FROM || process.env.SMTP_USER;

  const text = `Your ${purpose} OTP is ${otp}. It will expire in ${
    process.env.OTP_EXPIRE_MINUTES || 10
  } minutes.`;

  if (!transporter) {
    console.log(`[mail:dev] ${subject} for ${to}: ${otp}`);
    return;
  }

  try {
    await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html: `
        <p>Your ${purpose} OTP is:</p>
        <h2>${otp}</h2>
        <p>This OTP will expire in ${
          process.env.OTP_EXPIRE_MINUTES || 10
        } minutes.</p>
      `,
    });
  } catch (error) {
    console.error("Nodemailer failed to send email:", error.message);
    throw new ApiError(
      500,
      "Failed to send email. The mail server took too long to respond or rejected the credentials.",
    );
  }
};
