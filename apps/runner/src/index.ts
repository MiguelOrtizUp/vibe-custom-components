import express from 'express';
import cors from 'cors';
import { RUNNER_PORT } from './config';
import { logBus } from './logBus';
import routes from './routes';

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

app.use('/api', routes);

app.listen(RUNNER_PORT, () => {
  logBus.info(`[runner] Server listening on http://localhost:${RUNNER_PORT}`);
  logBus.info('[runner] Ready. Open the web UI to start.');
});
