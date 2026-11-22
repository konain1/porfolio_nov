import { Router } from 'express';
import { Profile, Service, Experience, Skill, Project } from '../models/index.js';

const router = Router();

// Everything the frontend needs in one round trip.
router.get('/', async (req, res, next) => {
  try {
    const [profile, services, experience, skills, projects] = await Promise.all([
      Profile.findOne().lean(),
      Service.find().sort('order').lean(),
      Experience.find().sort('order').lean(),
      Skill.find().sort('order').lean(),
      Project.find().sort('order').lean(),
    ]);
    if (!profile) return res.status(404).json({ message: 'No profile found. Run `npm run seed` in /backend.' });
    res.json({ profile, services, experience, skills, projects });
  } catch (err) {
    next(err);
  }
});

export default router;
