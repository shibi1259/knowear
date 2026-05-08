const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    slug: { type: String, required: true },
    isRoot: { type: Boolean, default: false },

    root: { type: mongoose.Types.ObjectId, ref: 'categories' },
    parent: { type: mongoose.Types.ObjectId, ref: 'categories' },
    
    path: { type: String },

    metaTitle: { type: String },
    metaDescription: { type: String },
    metaKeywords: { type: String },
    metaCanonical: { type: String },
    metaXCard: { type: String },
    metaImage: { type: String },

    thumbnail: { type: String },
    cover: { type: String },

    isActive: { type: Boolean, default: true },
    isDelete: { type: Boolean, default: false },
    isLanding: { type: Boolean, default: false },
    createdBy: { type: mongoose.Types.ObjectId, ref: 'admin.users' },
}, { timestamps: true });


module.exports = mongoose.model('categories', categorySchema);
