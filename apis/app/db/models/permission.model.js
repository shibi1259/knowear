const mongoose = require('mongoose');

const permissionSchema = mongoose.Schema({
    name: { type: String, required: true },
    tag: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    isDelete: { type: Boolean, default: false },
    createdBy: { type: mongoose.Types.ObjectId, ref: 'admin.users' },
}, { timestamps: true });

module.exports = mongoose.model('permissions', permissionSchema);