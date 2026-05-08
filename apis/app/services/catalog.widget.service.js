const db = require("../db/index")

exports.create = async (widget) => {
    try {
        let response = new db.CatalogWidget(widget)
        await response.save()
        return response;
    } catch (error) {
        throw (error)
    }
}

exports.findOne = async (query, projection = {}) => {
    try {
        let response = await db.CatalogWidget.findOne(query, projection).populate([
            { path: 'blogs', match: { _id: { $exists: true } } },
            { path: 'widgetImages.media', match: { _id: { $exists: true } } },
        ])
        return response
    } catch (error) {
        throw error
    }
}

exports.find = async (query, projection = {}, sort = {}) => {
    try {
        let response = await db.CatalogWidget.find(query, projection).sort(sort).populate([
            { path: 'blogs', match: { _id: { $exists: true } } },
            { path: 'widgetImages.media', match: { _id: { $exists: true } } },
        ])
        return response
    } catch (error) {
        throw error
    }
}

exports.update = async (query, widget) => {
    try {
        let response = await db.CatalogWidget.updateOne(query, { $set: widget }, {
            new: true, upsert: false, useFindAndModify: false
        }).exec();
        return response;
    } catch (error) {
        throw (error)
    }
}

exports.delete = async (query) => {
    try {
        let response = await db.CatalogWidget.deleteOne(query)
        return response
    } catch (error) {
        throw error
    }
}