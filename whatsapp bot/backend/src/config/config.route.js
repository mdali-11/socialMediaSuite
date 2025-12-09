import { Router } from 'express';
import { Config } from './config.model.js';

const router = Router();

// Get current config
router.get('/', async (_req, res) => {
  const doc = await Config.findOne().lean();
  res.json(doc || {});
});

// Upsert config
router.post('/', async (req, res) => {
  const payload = req.body || {};
  const updated = await Config.findOneAndUpdate({}, payload, {
    new: true,
    upsert: true,
    setDefaultsOnInsert: true,
  }).lean();
  res.json(updated);
});

export default router;


