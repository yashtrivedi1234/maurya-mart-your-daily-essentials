import { Resend } from "resend";

let resendInstance = null;

const getEmailSender = () => process.env.EMAIL_FROM || process.env.EMAIL_USER || "onboarding@resend.dev";

const getResendClient = () => {
  if (resendInstance) return resendInstance;

  if (!process.env.RESEND_API_KEY) {
    console.error("Resend API key missing in environment");
    return null;
  }

  resendInstance = new Resend(process.env.RESEND_API_KEY);
  return resendInstance;
};

export const isEmailConfigured = () => Boolean(process.env.RESEND_API_KEY && getEmailSender());

export const verifyEmailConfig = () => {
  if (!process.env.RESEND_API_KEY) {
    console.error("Resend API key missing in environment");
    return false;
  }

  if (!getEmailSender()) {
    console.error("Email sender missing in environment");
    return false;
  }

  return true;
};

export const sendEmail = async ({ to, subject, text, html, from }) => {
  try {
    const resend = getResendClient();

    if (!resend) {
      throw new Error("Resend client not initialized");
    }

    await resend.emails.send({
      from: from || getEmailSender(),
      to: Array.isArray(to) ? to : [to],
      subject,
      text,
      html,
    });
  } catch (error) {
    console.error("Email error", error.message);
    throw error;
  }
};

export const sendEmailAsync = (mailOptions) => {
  Promise.resolve(sendEmail(mailOptions)).catch((error) => {
    console.error("Async email error", {
      message: error.message,
      to: mailOptions?.to,
      subject: mailOptions?.subject,
      timestamp: new Date().toISOString(),
    });
  });
};

export default sendEmail;
