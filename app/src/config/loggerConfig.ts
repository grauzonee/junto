import { createLogger, format, transports } from "winston";
import DailyRotateFile from 'winston-daily-rotate-file';

const transportDebug = new DailyRotateFile({
    level: 'debug',
    filename: 'logs/debug-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d'
})

const transportInfo = new DailyRotateFile({
    level: 'info',
    filename: 'logs/system-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d'
})

const transportError = new DailyRotateFile({
    level: 'error',
    filename: 'logs/error-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d'
})

export const logger = createLogger({
    level: 'info',
    format: format.json(),
    transports: [
        transportDebug,
        transportInfo,
        transportError
    ]
})

if (process.env.NODE_ENV !== 'production') {
    logger.add(new transports.Console({
        format: format.simple()
    }))
}
