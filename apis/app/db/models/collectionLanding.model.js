const mongoose = require('mongoose');

const hotspotSchema = new mongoose.Schema({
    id: String,
    x: Number,
    y: Number,
    productId: {
        type: mongoose.Types.ObjectId,
        ref: "products"
    },
});

const collectionLandingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },

    // Categories section
    collection: [{
        type: mongoose.Types.ObjectId,
        ref: 'collections'
    }],

    // Main image
    mainImage: String,

    // First icon section
    firstIcon: String,
    firstIconTitle: String,
    firstIconDescription: String,

    // Second icon section
    secondIcon: String,
    secondIconTitle: String,
    secondIconDescription: String,

    // Bottom section
    bottomTitle: String,
    bottomDescription: String,

    // Products section 1
    products: [{
        type: mongoose.Types.ObjectId,
        ref: 'products'
    }],

    // Third icon section
    thirdIcon: String,
    thirdIconTitle: String,
    thirdIconDescription: String,

    // Fourth icon section
    fourthIcon: String,
    fourthIconTitle: String,
    fourthIconDescription: String,

    // Fifth icon section
    fifthIcon: String,
    fifthIconTitle: String,
    fifthIconDescription: String,

    // Sixth icon section
    sixthIcon: String,
    sixthIconTitle: String,
    sixthIconDescription: String,

    // Seventh icon section
    seventhIcon: String,
    seventhIconTitle: String,
    seventhIconDescription: String,
    eighthIcon: String,
    eighthIconTitle: String,
    eighthIconDescription: String,

    // Image grid section 1
    images: [String],

    // Products section 2
    products2: [{
        type: mongoose.Types.ObjectId,
        ref: 'products'
    }],

    // Video section
    video: String,

    // Products section 3
    products3: [{
        type: mongoose.Types.ObjectId,
        ref: 'products'
    }],

    // Interactive product display
    interactiveImage: String,
    hotspots: [hotspotSchema],

    // Image grid section 2
    images2: [String],

    // Products section 4
    products4: [{
        type: mongoose.Types.ObjectId,
        ref: 'products'
    }],

    // SEO fields
    metaTitle: String,
    metaDescription: String,
    metaKeywords: String,

    // Status and tracking
    isVisible: {
        type: Boolean,
        default: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isDelete: {
        type: Boolean,
        default: false
    },
    createdBy: {
        type: mongoose.Types.ObjectId,
        ref: 'admin.users'
    }
}, {
    timestamps: true
});

// Create indexes
collectionLandingSchema.index({ title: 1 });
collectionLandingSchema.index({ isActive: 1, isDelete: 1 });
collectionLandingSchema.index({ createdAt: -1 });

const CollectionLanding = mongoose.model('CollectionLanding', collectionLandingSchema);

module.exports = CollectionLanding;