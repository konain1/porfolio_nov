import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import portfolioRoutes from './routes/portfolio.js';
import projectRoutes from './routes/projects.js';
import contactRoutes from './routes/contact.js';
import { notFound, errorHandler } from './middleware/index.js';

const app = express();

// Sites allowed to call this API from the browser. CLIENT_URL (comma-separated) adds more.
const DEFAULT_ORIGINS = [
  'https://porfolionovfrontend.vercel.app',
  'http://localhost:5173',
  'http://localhost:4173',
];
const normalize = (o) => o.trim().replace(/\/+$/, ''); // "https://site.app/" → "https://site.app"
const origins = [
  ...new Set([...DEFAULT_ORIGINS, ...(process.env.CLIENT_URL || '').split(',').map(normalize).filter(Boolean)]),
];

app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: origins }));
app.use(express.json({ limit: '20kb' }));

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/contact', contactRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
