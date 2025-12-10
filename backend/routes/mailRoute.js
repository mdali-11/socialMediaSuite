import express from "express";
// import { sendEmail } from "./mailService.js";
import { sendEmail } from "../services/mailService.js";

const router = express.Router();

router.post("/send-mail", async (req, res) => {
  const body = req.body;

  const payload = {
    to: body.to,
    cc: body.cc,
    bcc: body.bcc,
    subject: body.subject,
    text: body.text,
    html: body.html,
    attachments: body.attachments,
  };

  const result = await sendEmail(payload);

  if (result.success) {
    return res.json({ status: true, message: "Mail sent", id: result.id });
  } else {
    return res.status(500).json({ status: false, message: "Mail failed", error: result.error });
  }
});

export default router;
