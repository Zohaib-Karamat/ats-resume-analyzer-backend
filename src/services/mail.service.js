import { Resend } from "resend";
import { ApiError } from "../utils/ApiError.js";

// Initialize Resend with the API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

export const sendOtpEmail = async ({ to, subject, otp, purpose }) => {
  // If you don't have a verified domain yet, Resend forces you to use onboarding@resend.dev
  // If you do have a verified domain, set it in your Railway variables as MAIL_FROM
  const from = process.env.MAIL_FROM || "onboarding@resend.dev";

  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      text: `Your ${purpose} OTP is ${otp}. It will expire in ${
        process.env.OTP_EXPIRE_MINUTES || 10
      } minutes.`,
      html: `
        <p>Your ${purpose} OTP is:</p>
        <h2>${otp}</h2>
        <p>This OTP will expire in ${
          process.env.OTP_EXPIRE_MINUTES || 10
        } minutes.</p>
      `,
    });

    if (error) {
      console.error("Resend API failed:", error);
      throw new Error(error.message);
    }

    console.log(
      `[mail:success] Email sent to ${to} via Resend. ID: ${data?.id}`,
    );
  } catch (error) {
    console.error("Failed to send email via Resend:", error.message);
    throw new ApiError(
      500,
      "Failed to send email. Ensure your Resend API key and domain configuration are correct.",
    );
  }
};
