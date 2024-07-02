import app from './app.js';
import { logger } from './config/winston.js';

const PORT = process.env.PORT ?? 5001;

app.listen(PORT, () => {
    logger.info(`Budgeting app listening on port ${PORT}`);
});
