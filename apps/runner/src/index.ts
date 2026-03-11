import express from 'express';
import cors from 'cors';
import sessionRoutes from './routes/session';
import libraryRoutes from './routes/library';
import componentRoutes from './routes/component';
import previewRoutes from './routes/preview';
import chatRoutes from './routes/chat';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/session', sessionRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/component', componentRoutes);
app.use('/api/preview', previewRoutes);
app.use('/api/chat', chatRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', version: '0.1.0' });
});

app.listen(PORT, () => {
  console.log(`[runner] Listening on http://localhost:${PORT}`);
});

export default app;
