const mongoose = require("mongoose");

const homeWidgetSchema = mongoose.Schema({
    title: { type: String },
    caption: { type: String },
    description: { type: String },
    widgetName: { type: String, required: true },

    refid: { type: String, required: true },
    slug: { type: String },
    index: { type: Number, required: true },
    visibility: { type: String, enum: ["all", "mobile", "web", "none"], default: "all" },
    buttonVisibility: { type: Boolean, default: false },
    buttonText: { type: String },
    buttonLink: { type: String },
    widgetType: {
        type: String, required: true, enum: [
            "products", "image-slider", "html", "video", , "hero-banner", "video-banner", "banner-counter"

        ]
    },
    widgetSlides: [{
        title: { type: String },
        description: { type: String },
        button: { type: String },
        redirection: { type: String },
        media: { type: mongoose.Schema.Types.ObjectId, ref: "medias" },
    }],
    collections: { type: mongoose.Schema.Types.ObjectId, ref: "collections" },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: "products" }],
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: "categories" }],
    brands: [{ type: mongoose.Schema.Types.ObjectId, ref: "brands" }],
    widgetImages: [{
        title: { type: String },
        description: { type: String },
        button: { type: String },
        redirection: { type: String },
        media: { type: mongoose.Schema.Types.ObjectId, ref: "medias" },
    }],
    video: { type: String },
    videoCover: {type: String},
    html: { type: String },
    htmlStyles: { type: String },
    htmlScripts: { type: String },
    styles: {
        marginLeft: { type: Number },
        marginRight: { type: Number },
        marginTop: { type: Number },
        marginBottom: { type: Number },
        backgroundColor: { type: String },
        backgroundImage: { type: mongoose.Schema.Types.ObjectId, ref: "medias", default: null },
        paddingTop: { type: Number },
        paddingBottom: { type: Number },
        paddingLeft: { type: Number },
        paddingRight: { type: Number },
        elevation: { type: Number, default: 0 },
        borderRadius: { type: Number },
        borderWidth: { type: Number },
        borderColor: { type: String },
    }
}, { timestamps: true })

module.exports = mongoose.model("home.widgets.history", homeWidgetSchema);