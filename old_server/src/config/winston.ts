import { createLogger, format, transports, Logger } from 'winston';

// Determine the log level based on the environment.
const logLevel: string =
    process.env.NODE_ENV === 'development' ? 'debug' : 'warn';

export const logger: Logger = createLogger({
    level: logLevel,
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.errors({ stack: true }), // Log errors with stack trace
        format.splat(), // Interpolate values in log messages
        format.prettyPrint(), // Pretty print format
        format.json(), // Produces structured logs in JSON format
    ),
    transports: [
        // Console transport
        new transports.Console({
            format: format.combine(
                format.printf(
                    (info) =>
                        `${info.timestamp} [${info.level}]: ${JSON.stringify(
                            info,
                            null,
                            4,
                        )}` + (info.stack ? '\n' + info.stack : ''),
                ),
            ),
            level: process.env.NODE_ENV === 'development' ? 'debug' : 'info', // Only log debug in development
        }),
        // File transports
        new transports.File({
            filename: 'logs/errors.log',
            level: 'error',
            handleExceptions: true,
        }),
        new transports.File({
            filename: 'logs/combined.log',
            level: logLevel,
            handleExceptions: true,
        }),
    ],
    exitOnError: false,
});
