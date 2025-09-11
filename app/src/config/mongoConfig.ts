import mongoose from "mongoose";
import { getConfigValue } from "@/helpers/configHelper";
import { logger } from "@/config/loggerConfig";

const mongoString = getConfigValue('MONGO_CONN_STRING')
export const connectToMongo = () => {
    mongoose.connect(mongoString).then(() => {
        logger.info("Connection to Mongo successfull!")
    }).catch(err => {
        logger.error("Connection to Mongo failed: " + err)
        process.exit(1)
    })
}

export async function disconnectFromMongo() {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
}
