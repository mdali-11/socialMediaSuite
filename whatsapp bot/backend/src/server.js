import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { connectToMongo } from './utils/mongo.js';
import webhookRouter from './webhook/webhook.route.js';
import configRouter from './config/config.route.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/config', configRouter);
app.use('/webhook', webhookRouter);

const PORT = process.env.PORT || 3000;

async function start() {
  await connectToMongo();
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start server', err);
  process.exit(1);
});


