import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { findUserByEmail } from '../models/user.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body ?? {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = await findUserByEmail(email.trim().toLowerCase());
  const passwordOk = user && (await bcrypt.compare(password, user.password_hash));

  // Same message for wrong email and wrong password
  if (!passwordOk) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 8 * 60 * 60 * 1000,
  });

  res.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

export default router;