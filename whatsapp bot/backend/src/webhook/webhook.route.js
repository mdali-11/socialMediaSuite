import { Router } from 'express';
import axios from 'axios';
import { Config } from '../config/config.model.js';

const router = Router();

// GET: webhook verification for WhatsApp Cloud API
router.get('/', async (req, res) => {
  const { 'hub.mode': mode, 'hub.challenge': challenge, 'hub.verify_token': token } = req.query;
  const cfg = await Config.findOne().lean();
  const verifyToken = cfg?.verifyToken || process.env.WHATSAPP_VERIFY_TOKEN;

  if (mode === 'subscribe' && token === verifyToken) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

// POST: receive messages and auto-reply with text only (no templates)
router.post('/', async (req, res) => {
  try {
    const data = req.body;

    // Respond 200 immediately to avoid retries
    res.sendStatus(200);

    const cfg = await Config.findOne().lean();
    if (!cfg?.autoReplyEnabled) return;

    const accessToken = cfg?.permanentAccessToken || process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = cfg?.phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID;
    const autoReplyText = cfg?.autoReplyText || 'Thanks for your message!';
    if (!accessToken || !phoneNumberId) return;

    const entries = data?.entry || [];
    for (const entry of entries) {
      const changes = entry?.changes || [];
      for (const change of changes) {
        const messages = change?.value?.messages || [];
        for (const message of messages) {
          if (message?.type !== 'text' && message?.type !== 'audio' && message?.type !== 'image' && message?.type !== 'video' && message?.type !== 'document' && message?.type !== 'reaction' && message?.type !== 'sticker' && message?.type !== 'location' && message?.type !== 'contacts' && message?.type !== 'interactive') {
            continue;
          }
          const from = message?.from;
          if (!from) continue;

          // Only reply to user-initiated messages, not our own or statuses
          if (message?.id?.startsWith('wamid.')) {
            await sendTextMessage({
              accessToken,
              phoneNumberId,
              to: from,
              text: autoReplyText,
            });
          }
        }
      }
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Webhook handler error', err);
  }
});

async function sendTextMessage({ accessToken, phoneNumberId, to, text }) {
  const url = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`;
  await axios.post(
    url,
    {
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: text },
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    }
  );
}

export default router;


