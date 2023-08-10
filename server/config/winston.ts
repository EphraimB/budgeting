import { createLogger, format, transports } from 'winston';

export const logger = createLogger({
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.printf(
            (info) => `${info.timestamp} [${info.level}]: ${info.message}`,
        ),
    ),
    transports: [
        // Log all logs error level and below to `error.log`
        new transports.File({ filename: 'logs/error.log', level: 'error' }),

        // Log all logs warning level and below to `combined.log`
        // This includes: { error, warn, info, http, verbose, debug, silly }
        new transports.File({ filename: 'logs/combined.log', level: 'warn' }),
    ],
});
