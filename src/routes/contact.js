import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { Message } from '../models/index.js';
import { requireAdmin } from '../middleware/index.js';

const router = Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many messages. Please try again in a few minutes.' },
});

function validate({ name = '', email = '', subject = '', message = '' }) {
  const errors = {};
  if (name.trim().length < 2 || name.length > 80) errors.name = 'Please enter your name.';
  if (!EMAIL_RE.test(email.trim())) errors.email = 'Please enter a valid email.';
  if (subject.length > 120) errors.subject = 'Subject is too long.';
  if (message.trim().length < 10) errors.message = 'Tell me a little more (10+ characters).';
  if (message.length > 2000) errors.message = 'Message is too long (2000 max).';
  return errors;
}

// Public: send a message from the contact form
router.post('/', contactLimiter, async (req, res, next) => {
  try {
    const body = req.body ?? {};
    // Honeypot: real users never fill the hidden "website" field
    if (body.website) return res.status(201).json({ message: 'Thanks! I will get back to you soon.' });

    const errors = validate(body);
    if (Object.keys(errors).length) return res.status(400).json({ message: 'Please fix the highlighted fields.', errors });

    const { name, email, subject, budget, message } = body;
    await Message.create({ name, email, subject, budget, message });
    res.status(201).json({ message: 'Thanks! Your message has been sent. I will get back to you within 24 hours.' });
  } catch (err) {
    next(err);
  }
});

// Admin: read messages (send header  x-admin-key: <ADMIN_KEY>)
router.get('/', requireAdmin, async (req, res, next) => {
  try {
    res.json(await Message.find().sort('-createdAt').lean());
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/read', requireAdmin, async (req, res, next) => {
  try {
    const msg = await Message.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    if (!msg) return res.status(404).json({ message: 'Message not found' });
    res.json(msg);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const msg = await Message.findByIdAndDelete(req.params.id);
    if (!msg) return res.status(404).json({ message: 'Message not found' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
