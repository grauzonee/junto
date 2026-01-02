/**
 * Entry point of the application.
 *
 * Responsibilities:
 * - Load environment variables
 * - Initialize configuration checks
 * - Connect to MongoDB
 * - Start the Express server
 * - Handle graceful shutdown on termination signals
 * 
 * @packageDocumentation
 */

import 'dotenv/config';
import app from '@/app';
import { logger } from "@/config/loggerConfig";
import { checkAllRequiredVars } from "@/helpers/configHelper";
import { connectToMongo, disconnectFromMongo } from "@/config/mongoConfig";
import { errorHandler } from '@/middlewares/errorHandler';

const PORT = process.env.PORT || 3000;

async function bootstrap() {
    checkAllRequiredVars()
    await connectToMongo();
}

bootstrap().catch(err => {
    logger.error("Failed to bootstrap app:", err);
    process.exit(1);
});
app.use(errorHandler);

app.listen(PORT, () => {
    logger.debug(`Server running at http://localhost:${PORT}`);
});

async function gracefulShutdown() {
    try {
        await disconnectFromMongo();
        process.exit(0);
    } catch (error) {
        logger.error('There was an error disconnecting from Mongo', error)
    }
}

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);


