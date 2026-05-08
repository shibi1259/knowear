const mongoose = require("mongoose");

const catalogWidgetSchema = mongoose.Schema({
    catalog: { type: mongoose.Schema.Types.ObjectId, ref: "catalogs", required: true },
    title: { type: String },
    description: { type: String },
    refid: { type: String, required: true },
    slug: { type: String },
    isDraft: { type: Boolean, default: true },
    isPublished: { type: Boolean, default: false },
    index: { type: Number, required: true },
    visibility: { type: String, enum: ["all", "mobile", "web", "none"], default: "all" },
    buttonVisibility: { type: Boolean, default: false },
    buttonText: { type: String },
    widgetName: { type: String, required: true },
    buttonLink: { type: String },
    widgetType: {
        type: String, required: true, enum: [
            "products", "categories",
            "brands", "blogs", "image-slider",
            "html", "classic-banners",
            "magestic-mosaic", "glamour-glaze",
            "dazzle-design", "grandeur-gallery",
            "celestial-canvas"
        ]
    },
    view: { type: String, enum: ["grid", "slider"] },
    slidesPerCount: { type: Number, default: 3 },
    gridsPerCount: { type: Number, default: 4 },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: "products" }],
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: "categories" }],
    brands: [{ type: mongoose.Schema.Types.ObjectId, ref: "brands" }],
    blogs: [{ type: mongoose.Schema.Types.ObjectId, ref: "blogs" }],
    widgetImages: [{
        title: { type: String },
        redirection: { type: String },
        media: { type: mongoose.Schema.Types.ObjectId, ref: "medias" },
    }],
    html: { type: String },
    htmlStyles: { type: String },
    style: {
        marginLeft: { type: String },
        marginRight: { type: String },
        marginTop: { type: String },
        marginBottom: { type: String },
        backgroundColor: { type: String },
        backgroundImage: { type: mongoose.Schema.Types.ObjectId, ref: "medias" },
        paddingTop: { type: String },
        paddingBottom: { type: String },
        paddingLeft: { type: String },
        paddingRight: { type: String },
        borderRadius: { type: String },
        border: { type: String },
        borderWidth: { type: String },
        borderColor: { type: String },
    }
}, { timestamps: true })

module.exports = mongoose.model("catalog.widgets", catalogWidgetSchema);