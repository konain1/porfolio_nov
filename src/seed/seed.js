import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { Profile, Service, Experience, Skill, Project } from '../models/index.js';
import data from './data.js';

async function seed() {
  await connectDB();
  // Messages are never touched by the seed.
  await Promise.all([Profile, Service, Experience, Skill, Project].map((M) => M.deleteMany({})));
  await Profile.create(data.profile);
  await Service.insertMany(data.services.map((s, i) => ({ ...s, order: i })));
  await Experience.insertMany(data.experience.map((e, i) => ({ ...e, order: i })));
  await Skill.insertMany(data.skills.map((s, i) => ({ ...s, order: i })));
  await Project.insertMany(data.projects.map((p, i) => ({ ...p, order: i })));
  console.log('Seed complete ✔');
}

seed()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
