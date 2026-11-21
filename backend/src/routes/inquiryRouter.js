import express from 'express';
import requireAuth from '../middleware/requireAuth.js';
import { createInquiry, findOpenDuplicate } from '../models/inquiry.js';
import { createInquirySchema } from '../validation/inquirySchemas.js';

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