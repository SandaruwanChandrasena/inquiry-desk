import express from 'express';
import requireAuth from '../middleware/requireAuth.js';
import {
  createInquiry,
  findOpenDuplicate,
  listInquiries,
  findInquiryById,
} from '../models/inquiry.js';
import {
  createInquirySchema,
  listQuerySchema,
  idParamSchema,
} from '../validation/inquirySchemas.js';

const router = express.Router();

// Every inquiry route needs a logged-in user
router.use(requireAuth);

// Turn zod issues into { field: "first message" }
function fieldErrors(zodError) {
  const fields = {};
  for (const issue of zodError.issues) {
    const field = issue.path[0];
    if (!fields[field]) fields[field] = issue.message;
  }
  return fields;
}

router.get('/', async (req, res) => {
  const result = listQuerySchema.safeParse(req.query);

  if (!result.success) {
    return res.status(400).json({
      error: 'Invalid filter',
      fields: fieldErrors(result.error),
    });
  }

  const inquiries = await listInquiries({
    userId: req.user.id,
    role: req.user.role,
    ...result.data,
  });

  res.json({ inquiries });
});

router.get('/:id', async (req, res) => {
  const params = idParamSchema.safeParse(req.params);

  if (!params.success) {
    return res.status(400).json({ error: params.error.issues[0].message });
  }

  const inquiry = await findInquiryById(params.data.id, req.user);

  // Same 404 for "does not exist" and "not yours"
  if (!inquiry) {
    return res.status(404).json({ error: 'Inquiry not found' });
  }

  res.json({ inquiry });
});

router.post('/', async (req, res) => {
  const result = createInquirySchema.safeParse(req.body ?? {});

  if (!result.success) {
    return res.status(400).json({
      error: 'Please fix the highlighted fields',
      fields: fieldErrors(result.error),
    });
  }

  const duplicate = await findOpenDuplicate(result.data);

  if (duplicate) {
    return res.status(409).json({
      error: 'An open inquiry with the same contact and subject already exists',
    });
  }

  const inquiry = await createInquiry(result.data, req.user.id);
  res.status(201).json({ inquiry });
});

export default router;