/**
 * Module for MongoDB configuration and connection management.
 *
 * Responsibilities:
 * - Connect to MongoDB using Mongoose
 * - Disconnect from MongoDB
 * 
 * @packageDocumentation
 */

import mongoose from "mongoose";
import { getConfigValue } from "@/helpers/configHelper";
import { logger } from "@/config/loggerConfig";

const mongoString = getConfigValue('MONGO_CONN_STRING')

/**
 * Establishes a connection to the MongoDB database.
 */
export const connectToMongo = async () => {
    try {
        await mongoose.connect(mongoString);
        logger.info("Connection to Mongo successful!");
    } catch (err) {
        logger.error("Connection to Mongo failed:", err);
        process.exit(1);
    }
};

/**
 * Disconnects from the MongoDB database.
 */
export async function disconnectFromMongo() {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
    }
}
