const mongoConfig = {
    conn: {
        server: process.env.mongoDomain,
        port: process.env.mongoPort,
        database: process.env.mongoDbName,
        user: process.env.mongoUser,
        password: process.env.mongoPassword,
    }
}
mongoConfig.options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}

module.exports = {
    mongoConf: {
        conString: process.env.MONGODB,
        options: mongoConfig.options
    },
}
