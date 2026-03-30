import "dotenv/config";
import { connectToMongo, disconnectFromMongo } from "@/config/mongoConfig";
import { auditIntegrity } from "@/services/integrityAuditService";
import { logger } from "@/config/loggerConfig";

async function main() {
    const shouldFix = process.argv.includes("--fix");

    await connectToMongo();
    try {
        const report = await auditIntegrity({ fix: shouldFix });
        logger.info(JSON.stringify(report, null, 2));
    } finally {
        await disconnectFromMongo();
    }
}

main().catch(async error => {
    logger.error(error);
    await disconnectFromMongo();
    process.exit(1);
});
