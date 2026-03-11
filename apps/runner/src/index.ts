import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { RUNNER_PORT } from './config';
import { logBus } from './logBus';
import routes from './routes';

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

// Rate limiting: protect all API routes from abuse
// Since this is a local-only service we use generous limits.
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 120,           // 120 requests per minute
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Too many requests, please slow down.' },
});
app.use('/api', limiter);

app.use('/api', routes);

app.listen(RUNNER_PORT, () => {
  logBus.info(`[runner] Server listening on http://localhost:${RUNNER_PORT}`);
  logBus.info('[runner] Ready. Open the web UI to start.');
});
