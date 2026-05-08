const mongoose = require('mongoose');

const customMailerSchema = mongoose.Schema({
    slug: { type: String, required: true },
    subject: { type: String, required: true },
    type: { type: String, required: true },
    email: { type: String, required: true },
    isDelete: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'admin.users' }
}, { timestamps: true });

module.exports = mongoose.model('custom.mailers', customMailerSchema);