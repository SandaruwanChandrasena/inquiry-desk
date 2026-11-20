import express from 'express';
import cookieParser from 'cookie-parser';
import pool from './db.js';
import authRouter from './routes/authRouter.js';

const app = express();

app.use(express.json());
app.use(cookieParser());

// Health check: proves the API can reach the database
app.get('/api/health', async (req, res) => {
  await pool.query('SELECT 1');
  res.json({ status: 'ok', database: 'connected' });
});

app.use('/api/auth', authRouter);

export default app;