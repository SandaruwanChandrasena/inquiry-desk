import { z } from 'zod';

// Trim text, and turn "" or a missing value into null
const blankToNull = (value) => {
  if (value === undefined) return null;
  if (typeof value === 'string') return value.trim() || null;
  return value;
};

const requiredText = (label, max) =>
  z
    .string(`${label} is required`)
    .trim()
    .min(1, `${label} is required`)
    .max(max, `${label} must be ${max} characters or less`);

export const createInquirySchema = z
  .object({
    customer_name: requiredText('Customer name', 100),
    email: z.preprocess(blankToNull, z.email('Email is not valid').max(255).nullable()),
    phone: z.preprocess(blankToNull, z.string().max(30, 'Phone is too long').nullable()),
    subject: requiredText('Subject', 150),
    description: requiredText('Description', 2000),
  })
  .refine((data) => data.email || data.phone, {
    message: 'Give an email or a phone number',
    path: ['contact'],
  });