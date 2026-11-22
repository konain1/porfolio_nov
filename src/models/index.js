import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const profileSchema = new Schema(
  {
    name: { type: String, required: true },
    role: { type: String, required: true },
    intro: String,
    aboutTitle: String,
    aboutHighlight: String,
    about: String,
    email: String,
    phone: String,
    location: String,
    careerStart: Date,
    available: { type: Boolean, default: true },
    avatar: String,
    resumeUrl: String,
    stats: [{ value: String, label: String, _id: false }],
    socials: {
      linkedin: String,
      github: String,
      twitter: String,
      instagram: String,
      whatsapp: String,
    },
  },
  { timestamps: true }
);

const serviceSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  icon: String,
  order: { type: Number, default: 0 },
});

const experienceSchema = new Schema({
  kind: { type: String, enum: ['work', 'education'], required: true },
  title: { type: String, required: true },
  org: String,
  period: String,
  badge: String,
  icon: String,
  order: { type: Number, default: 0 },
});

const skillSchema = new Schema({
  name: { type: String, required: true },
  level: { type: Number, min: 0, max: 100, default: 80 },
  icon: String,
  order: { type: Number, default: 0 },
});

const projectSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    subtitle: String,
    description: String,
    category: { type: String, enum: ['web', 'mobile'], default: 'web' },
    tech: [String],
    color: { type: String, default: '#8b5cf6' },
    image: String,
    liveUrl: String,
    githubUrl: String,
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const messageSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 120 },
    subject: { type: String, trim: true, maxlength: 120 },
    budget: { type: String, trim: true, maxlength: 40 },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Profile = model('Profile', profileSchema);
export const Service = model('Service', serviceSchema);
export const Experience = model('Experience', experienceSchema);
export const Skill = model('Skill', skillSchema);
export const Project = model('Project', projectSchema);
export const Message = model('Message', messageSchema);
