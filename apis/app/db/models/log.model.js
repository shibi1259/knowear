const mongoose = require("mongoose")

const logSchema = mongoose.Schema({
    metadata: {
        importId: String,
    },
    level: String,
    message: String,
    timestamp: Date,
})

module.exports = mongoose.model('logs', logSchema)