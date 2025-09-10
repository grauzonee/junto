import 'dotenv/config';
import app from '@/app';
const PORT = process.env.PORT || 3000;
import { logger } from "@/config/loggerConfig";
import { checkAllRequiredVars } from "@/helpers/configHelper";
import { connectToMongo } from "@/config/mongoConfig";

async function bootstrap() {
    checkAllRequiredVars()
    connectToMongo();
}

bootstrap().catch(err => {
    logger.error("Failed to bootstrap app:", err);
    process.exit(1);
});

app.listen(PORT, () => {
    logger.debug(`Server running at http://localhost:${PORT}`);
});


