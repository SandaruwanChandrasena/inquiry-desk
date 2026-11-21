import { z } from 'zod';

export const STATUSES = ['new', 'in_progress', 'resolved'];

// Trim text, and turn "" or a missing value into null
const blankToNull = (value) => {
  if (value === undefined) return null;
  if (typeof value === 'string') return value.trim() || null;
  return value;
};

// Same idea for query strings: "" means "no filter"
const blankToUndefined = (value) =>
  typeof value === 'string' && value.trim() === '' ? undefined : value;

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

export const listQuerySchema = z.object({
  status: z.preprocess(
    blankToUndefined,
    z.enum(STATUSES, 'Status must be new, in_progress or resolved').optional()
  ),
  search: z.preprocess(
    blankToUndefined,
    z.string('Search must be text').trim().max(100, 'Search is too long').optional()
  ),
});

// URL ids arrive as text, so coerce turns "5" into 5
export const idParamSchema = z.object({
  id: z.coerce
    .number('Inquiry id must be a number')
    .int('Inquiry id must be a whole number')
    .positive('Inquiry id must be a positive number')
    .max(2147483647, 'Inquiry id is too large'),
});