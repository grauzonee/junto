import 'dotenv/config';
import app from '@/app';
const PORT = process.env.PORT || 3000;
import { logger } from "@/config/loggerConfig";
import { checkAllRequiredVars } from "@/helpers/configHelper";
import { connection } from "@/config/redisConfig"
import { connectToMongo } from "@/config/mongoConfig";

checkAllRequiredVars()
connectToMongo();
connection.on("connect", () => {
    logger.debug("Connected to Redis");
});
app.listen(PORT, () => {
    logger.debug(`Server running at http://localhost:${PORT}`);
});


