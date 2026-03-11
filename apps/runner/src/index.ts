import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import sessionRoutes from './routes/session';
import libraryRoutes from './routes/library';
import componentRoutes from './routes/component';
import previewRoutes from './routes/preview';
import chatRoutes from './routes/chat';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// General rate limiter – applied to all routes
const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

// Stricter limiter for auth/session routes (prevent brute-force)
const sessionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many session requests, please try again later.' },
});

// Limiter for component-creation (file system writes)
const componentLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many component requests, please try again later.' },
});

app.use(generalLimiter);

app.use('/api/session', sessionLimiter, sessionRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/component', componentLimiter, componentRoutes);
app.use('/api/preview', previewRoutes);
app.use('/api/chat', chatRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', version: '0.1.0' });
});

app.listen(PORT, () => {
  console.log(`[runner] Listening on http://localhost:${PORT}`);
});

export default app;
