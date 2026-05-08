const mongoose = require('mongoose');

const fileImportSchema = mongoose.Schema({
    title: { type: String, required: true },
    status: { type: String, enum: ['progress', 'completed', 'failed', 'awaiting'], default: 'awaiting' },
    type: { type: String, enum: ['products', 'users', 'categories'], required: true },
    slug: { type: String, required: true },
    percentage: { type: Number, default: 0 },
    s3Location: { type: String, required: true },
    totalRows: { type: Number, default: 0 },
    processedRows: { type: Number, default: 0 },
    skippedRows: { type: Number, default: 0 },
    executionTime: { type: Number, default: 0 },
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'admin.users' },
}, { timestamps: true })

module.exports = mongoose.model('file.imports', fileImportSchema);