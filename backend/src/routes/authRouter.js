import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { findUserByEmail, findUserById } from '../models/user.js';
import requireAuth from '../middleware/requireAuth.js';

const router = express.Router();

// Login and logout must use the same options, or the browser will not clear the cookie
const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
};

router.post('/login', async (req, res) => {
  const { email, password } = req.body ?? {};

  // typeof check: a number or array here would crash .trim() and bcrypt (500)
  if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
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

  res.cookie('token', token, { ...cookieOptions, maxAge: 8 * 60 * 60 * 1000 });

  res.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

router.post('/logout', (req, res) => {
  res.clearCookie('token', cookieOptions);
  res.json({ message: 'Logged out' });
});

router.get('/me', requireAuth, async (req, res) => {
  const user = await findUserById(req.user.id);

  if (!user) {
    return res.status(401).json({ error: 'User no longer exists' });
  }

  res.json({ user });
});

export default router;