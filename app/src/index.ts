import 'dotenv/config';
import app from '@/app';
const PORT = process.env.PORT || 3000;
import { logger } from "@/config/loggerConfig";
import { checkAllRequiredVars } from "@/helpers/configHelper";
import { connectToMongo, disconnectFromMongo } from "@/config/mongoConfig";

async function bootstrap() {
    checkAllRequiredVars()
    await connectToMongo();
}

bootstrap().catch(err => {
    logger.error("Failed to bootstrap app:", err);
    process.exit(1);
});

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


