export function requireAdmin(req, res, next) {
  const key = process.env.ADMIN_KEY;
  if (!key) return res.status(503).json({ message: 'ADMIN_KEY is not configured on the server.' });
  if (req.get('x-admin-key') !== key) return res.status(401).json({ message: 'Unauthorized' });
  next();
}

export function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: 'Validation failed', errors: Object.values(err.errors).map((e) => e.message) });
  }
  if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid id' });
  console.error(err);
  res.status(err.status || 500).json({ message: err.status ? err.message : 'Something went wrong' });
}
