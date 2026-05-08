const winston = require("winston");
require("winston-mongodb");

const logger = winston.createLogger({
    transports: [
        new winston.transports.MongoDB({
            level: "info", // Log level
            db: process.env.MONGO_URI, // MongoDB connection string
            collection: "logs", // Collection name for logs
            options: { useUnifiedTopology: true },
        }),
    ],
});

module.exports = logger;
