const mongoose = require('mongoose');

const roleSchema = mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    slug: { type: String, required: true },
    permissions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'permissions', required: true }],
    isActive: { type: Boolean, default: true },
    isDelete: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'admin.users' },
}, { timestamps: true });

module.exports = mongoose.model('roles', roleSchema);
