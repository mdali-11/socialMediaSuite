# WhatsApp Bot (Express + MongoDB + Vite React)

This project provides a minimal backend and frontend to auto-reply to incoming WhatsApp user messages using the WhatsApp Cloud API. No template messages are sent; only direct text replies to inbound user messages.

## Features
- Express backend with MongoDB Atlas (Mongoose)
- WhatsApp webhook verification and message handler
- Auto-reply toggle and customizable reply text
- React (Vite) frontend to manage config

## Prerequisites
- Node.js 18+
- MongoDB Atlas cluster and connection string
- WhatsApp Cloud API app, a phone number ID, and a permanent access token

## Setup

### Backend
1. Create env file `backend/.env` with:
```
PORT=3000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxxx.mongodb.net/
MONGODB_DB=whatsapp_bot
WHATSAPP_VERIFY_TOKEN=change-me
WHATSAPP_ACCESS_TOKEN=EAAG...token
WHATSAPP_PHONE_NUMBER_ID=1234567890
```
2. Install deps and run:
```bash
cd backend
npm i
npm run dev
```
3. Health check: `http://localhost:3000/health`

### Frontend
```bash
cd frontend
npm i
npm run dev
```
Open: `http://localhost:5173`.

The frontend proxies `'/api'` and `'/webhook'` to the backend.

### Configure
- In the frontend, fill in Phone Number ID, Verify Token, and Permanent Access Token. Save.
- Toggle auto-reply and set the text.

### WhatsApp Webhook
Expose your backend using a tunnel (e.g., ngrok):
```bash
ngrok http 3000
```
- Set the callback URL in Meta to: `https://YOUR-NGROK-DOMAIN/webhook`
- Set verify token to the same value you saved in the config
- Subscribe to `messages`

When a user sends a message to your WhatsApp number, the backend will auto-reply with your configured text.

## Notes
- This demo replies to any inbound message type by sending a text reply. No templates are used.
- Config is stored in MongoDB; env variables act as fallback until saved.


