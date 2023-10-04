import app from './app.js';
import { logger } from './config/winston.js';

const PORT = process.env.PORT ?? 8080;

app.listen(PORT, () => {
    logger.info(`Cron listening on port ${PORT}`);
});
