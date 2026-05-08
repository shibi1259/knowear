const mongoose = require('mongoose');

const searchHistorySchema = mongoose.Schema({
    deviceToken: { type: String, required: true },
    searchHistory: [{ type: String, required: true }],
    isDelete: { type: Boolean, default: false },
})

module.exports = mongoose.model('search.history', searchHistorySchema);