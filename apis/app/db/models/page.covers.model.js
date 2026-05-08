const mongoose = require("mongoose");

const pageCoverSchema = mongoose.Schema(
    {
        title: { type: String, required: true, enum: ['Reviews', 'About Us', 'FAQs', 'Contact Us', 'Stores'] },
        path: { type: String, required: true, enum: ['/reviews', '/about', '/contact-us', '/faq', '/stores'] },
        desktopCover: { type: mongoose.Schema.Types.ObjectId, ref: "medias" },
        mobileCover: { type: mongoose.Schema.Types.ObjectId, ref: "medias" },
        isActive: { type: Boolean, default: true },
        isDelete: { type: Boolean, default: false }
    }, { timestamps: true, });

module.exports = mongoose.model("pagecovers", pageCoverSchema);
