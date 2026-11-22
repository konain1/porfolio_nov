import 'dotenv/config';
import app from './app.js';
import { connectDB } from './config/db.js';
import { verifyMailer } from './config/mailer.js';

const PORT = process.env.PORT || 5050;

connectDB()
  .then(() =>
    app.listen(PORT, () => {
      console.log(`API running on http://localhost:${PORT}`);
      verifyMailer();
    })
  )
  .catch((err) => {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  });
