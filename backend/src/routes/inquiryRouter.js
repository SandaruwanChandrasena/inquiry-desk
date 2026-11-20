import express from 'express';
import requireAuth from '../middleware/requireAuth.js';
import { createInquiry } from '../models/inquiry.js';

const router = express.Router();

// Every inquiry route needs a logged-in user
router.use(requireAuth);

router.post('/', async (req, res) => {
  const { customer_name, email, phone, subject, description } = req.body ?? {};

  const inquiry = await createInquiry(
    { customer_name, email: email ?? null, phone: phone ?? null, subject, description },
    req.user.id
  );

  res.status(201).json({ inquiry });
});

export default router;