import nodemailer from "nodemailer";

// Create transporter (Gmail example — you can use SMTP or any provider)
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});

/**
 * Send email
 * @param {Object} payload
 * @param {string|string[]} payload.to
 * @param {string|string[]} [payload.cc]
 * @param {string|string[]} [payload.bcc]
 * @param {string} payload.subject
 * @param {string} payload.text
 * @param {string} payload.html
 * @param {array} payload.attachments
 */

export async function sendEmail(payload) {
  try {
    const mailOptions = {
      from: process.env.MAIL_USER,
      to: payload.to,
      cc: payload.cc || undefined,
      bcc: payload.bcc || undefined,
      subject: payload.subject,
      text: payload.text || "",
      html: payload.html || "",
      attachments: payload.attachments || [],
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", result.messageId);

    return { success: true, id: result.messageId };
  } catch (error) {
    console.error("Email sending failed:", error);
    return { success: false, error };
  }
}
