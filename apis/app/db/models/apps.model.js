const mongoose = require("mongoose");

const appSchema = mongoose.Schema({
    android: {
        link: { type: String },
        package: { type: String },
        version: { type: String },
        forceUpdate: { type: Boolean, default: false },
        name: { type: String },
        buildName: { type: String },
        buildCode: { type: String },
        appIcon: { type: String },
        splashIcon: { type: String },
        splashBackground: { type: String }
    },
    ios: {
        link: { type: String },
        package: { type: String },
        version: { type: String },
        forceUpdate: { type: Boolean, default: false },
        name: { type: String },
        buildName: { type: String },
        buildCode: { type: String },
        appIcon: { type: String },
        splashIcon: { type: String },
        itunesId: { type: String },
        splashBackground: { type: String }
    },
    refid: { type: String, default: '1' },
    createdBy: { type: mongoose.Types.ObjectId, ref: 'admin.users' },
}, { timestamps: true })

module.exports = mongoose.model("apps", appSchema);