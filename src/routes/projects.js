import { Router } from 'express';
import { Project } from '../models/index.js';
import { requireAdmin } from '../middleware/index.js';

const router = Router();
const FIELDS = ['title', 'subtitle', 'description', 'category', 'tech', 'color', 'image', 'liveUrl', 'githubUrl', 'order'];
const pick = (body) => Object.fromEntries(FIELDS.filter((f) => body[f] !== undefined).map((f) => [f, body[f]]));

router.get('/', async (req, res, next) => {
  try {
    const filter = ['web', 'mobile'].includes(req.query.category) ? { category: req.query.category } : {};
    res.json(await Project.find(filter).sort('order').lean());
  } catch (err) {
    next(err);
  }
});

router.post('/', requireAdmin, async (req, res, next) => {
  try {
    res.status(201).json(await Project.create(pick(req.body)));
  } catch (err) {
    next(err);
  }
});

router.put('/:id', requireAdmin, async (req, res, next) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, pick(req.body), { new: true, runValidators: true });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
