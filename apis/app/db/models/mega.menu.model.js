const mongoose = require("mongoose");

const megaMenuSchema = mongoose.Schema(
    {
        title: { type: String },
        index: { type: Number },
        redirection: { type: String },

        subMenus: [
            {
                title: { type: String },
                redirection: { type: String },
                childNodes: [
                    {
                        title: { type: String },
                        redirection: { type: String },
                    },
                ],
            },
        ],
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "admin.users" },
    },
    { timestamps: true }
);

module.exports = mongoose.model("mega.menus", megaMenuSchema);
