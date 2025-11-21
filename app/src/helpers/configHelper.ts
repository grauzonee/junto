/**
 * Helper functions for configuration management.
 * 
 * @packageDocumentation
 */

import { logger } from "@/config/loggerConfig";

/**
 * Checks that all required environment variables are set.
 * Exits the process if any are missing.
 */
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

/**
 * Retrieves the value of an environment variable.
 * @param string fieldName 
 * @returns value of the environment variable
 * Exits the process if the variable is not set.
 */
export function getConfigValue(fieldName: string): string {
    const value = process.env[fieldName];
    if (value === undefined) {
        logger.error(fieldName + " is not set in .env file!");
        process.exit(1)
    }
    return value;
}
