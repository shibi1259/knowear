const mongoose = require('mongoose')

const activitySchema = mongoose.Schema({
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'admin.users', requireed: true },
    activity: { type: String, required: true },
    time: { type: String, required: true },
    date: { type: Date },
    refid: { type: String, required: true },
}, { timestamps: true })

module.exports = mongoose.model('store.activities', activitySchema)