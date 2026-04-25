import { Router } from 'express';
import mongoose from 'mongoose';

const router = Router();

router.get('/', (_req, res) => {
  const dbState = mongoose.connection.readyState;
  const states: Record<number, string> = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    db: states[dbState] || 'unknown',
    uptime: Math.floor(process.uptime()),
  });
});

export default router;
