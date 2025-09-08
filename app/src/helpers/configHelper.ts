import { logger } from "@/config/loggerConfig";

export function checkAllRequiredVars() {
    const requiredVars = [
        'NODE_ENV',
        'PORT',
        'MONGO_CONN_STRING',
        'REDIS_HOST',
        'REDIS_PASS'
    ];
    requiredVars.forEach((varName) => {
        getConfigValue(varName);
    })
}

export function getConfigValue(fieldName: string): string {
    const value = process.env[fieldName];
    if (value === undefined) {
        logger.error(fieldName + " is not set in .env file!");
        process.exit(1)
    }
    return value;
}
