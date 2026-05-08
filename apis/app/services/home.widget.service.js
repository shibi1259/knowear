const db = require("../db/index");

exports.create = async (widget) => {
    try {
        let response = new db.HomeWidget(widget)
        await response.save()
        return response;
    } catch (error) {
        throw (error)
    }
}

exports.findOne = async (query, projection = {}) => {
    try {
        let response = await db.HomeWidget.findOne(query, projection).populate([
            { path: 'blogs', match: { _id: { $exists: true } } },
            { path: "productsAdThumbnail", match: { _id: { $exists: true } } },
            { path: "hyperLinkThumbnail", match: { _id: { $exists: true } } },
            { path: "insightHubThumbnailLarge", match: { _id: { $exists: true } } },
            { path: "insightHubThumbnailSmall", match: { _id: { $exists: true } } },
            { path: "titleImage", match: { _id: { $exists: true } } },
            { path: 'testimonials', match: { _id: { $exists: true } } },
            { path: 'styles.backgroundImage', match: { _id: { $exists: true } } },
            { path: 'collections', match: { _id: { $exists: true } } },
            { path: 'saleThumbnail', match: { _id: { $exists: true } } },
            { path: 'widgetImages.media', match: { _id: { $exists: true } } },
        ]).populate({
            path: 'products',
            match: { _id: { $exists: true } },
            populate: { path: 'thumbnail', match: { _id: { $exists: true } } },
            populate: { path: "productIcons", match: { _id: { $exists: true } } },
        })
        return response
    } catch (error) {
        throw error
    }
}

exports.find = async (query, projection = {}, sort = {}) => {
    try {
        let response = await db.HomeWidget.find(query, projection).sort(sort).populate([
            { path: 'blogs', match: { _id: { $exists: true } } },
            { path: "productsAdThumbnail", match: { _id: { $exists: true } } },
            { path: "hyperLinkThumbnail", match: { _id: { $exists: true } } },
            { path: "insightHubThumbnailLarge", match: { _id: { $exists: true } } },
            { path: "insightHubThumbnailSmall", match: { _id: { $exists: true } } },
            { path: "titleImage", match: { _id: { $exists: true } } },
            { path: 'testimonials', match: { _id: { $exists: true } } },
            { path: 'styles.backgroundImage', match: { _id: { $exists: true } } },
            { path: 'collections', match: { _id: { $exists: true } } },
            { path: 'saleThumbnail', match: { _id: { $exists: true } } },
            { path: 'products', match: { _id: { $exists: true } } },
            { path: 'widgetImages.media', match: { _id: { $exists: true } } },
        ])
        return response
    } catch (error) {
        throw error
    }
}

exports.previewWidgets = async (query, projection = {}, sort = {}) => {
    try {
        let response = await db.HomeWidget.find(query, projection).sort(sort).populate([
            { path: "titleImage", match: { _id: { $exists: true } } },
            { path: "productsAdThumbnail", match: { _id: { $exists: true } } },
            { path: "hyperLinkThumbnail", match: { _id: { $exists: true } } },
            { path: "insightHubThumbnailLarge", match: { _id: { $exists: true } } },
            { path: "insightHubThumbnailSmall", match: { _id: { $exists: true } } },
            { path: 'blogs', match: { _id: { $exists: true } } },
            { path: 'testimonials', match: { _id: { $exists: true } } },
            { path: 'styles.backgroundImage', match: { _id: { $exists: true } } },
            { path: 'collections', match: { _id: { $exists: true } } },
            { path: 'saleThumbnail', match: { _id: { $exists: true } } },
            { path: 'products', match: { _id: { $exists: true } } },
            { path: 'widgetImages.media', match: { _id: { $exists: true } } },
        ])
        return response
    } catch (error) {
        throw error
    }
}

exports.draftsWidgets = async (query, projection = {}, sort = {}) => {
    try {
        let response = await db.HomeWidgetDraft.find(query, projection).sort(sort).populate([
            { path: "titleImage", match: { _id: { $exists: true } } },
            { path: "productsAdThumbnail", match: { _id: { $exists: true } } },
            { path: "hyperLinkThumbnail", match: { _id: { $exists: true } } },
            { path: "insightHubThumbnailLarge", match: { _id: { $exists: true } } },
            { path: "insightHubThumbnailSmall", match: { _id: { $exists: true } } },
            { path: 'blogs', match: { _id: { $exists: true } } },
            { path: 'testimonials', match: { _id: { $exists: true } } },
            { path: 'styles.backgroundImage', match: { _id: { $exists: true } } },
            { path: 'collections', match: { _id: { $exists: true } } },
            { path: 'saleThumbnail', match: { _id: { $exists: true } } },
            { path: 'products', match: { _id: { $exists: true } } },
            { path: 'widgetImages.media', match: { _id: { $exists: true } } },
        ])
        return response
    } catch (error) {
        throw error
    }
}

exports.publishedWidgets = async (query, projection = {}, sort = {}) => {
    try {
        let response = await db.HomeWidgetPublish.find(query, projection).sort(sort).populate([
            { path: "titleImage", match: { _id: { $exists: true } } },
            { path: "productsAdThumbnail", match: { _id: { $exists: true } } },
            { path: "hyperLinkThumbnail", match: { _id: { $exists: true } } },
            { path: "insightHubThumbnailLarge", match: { _id: { $exists: true } } },
            { path: "insightHubThumbnailSmall", match: { _id: { $exists: true } } },
            { path: 'blogs', match: { _id: { $exists: true } } },
            { path: 'testimonials', match: { _id: { $exists: true } } },
            { path: 'styles.backgroundImage', match: { _id: { $exists: true } } },
            { path: 'collections', match: { _id: { $exists: true } } },
            { path: 'saleThumbnail', match: { _id: { $exists: true } } },
            { path: 'products', match: { _id: { $exists: true } } },
            { path: 'widgetImages.media', match: { _id: { $exists: true } } },
        ])
        return response
    } catch (error) {
        throw error
    }
}

exports.search = async (query, projection = {}, sort = {}, page, limit = 5) => {
    try {
        let count = await db.HomeWidget.countDocuments(query)
        let response = await db.HomeWidget.find(query, projection).limit(limit * 1).skip((page - 1) * limit).sort(sort)
            .populate([
                { path: "titleImage", match: { _id: { $exists: true } } },
                { path: "productsAdThumbnail", match: { _id: { $exists: true } } },
                { path: "hyperLinkThumbnail", match: { _id: { $exists: true } } },
                { path: "insightHubThumbnailLarge", match: { _id: { $exists: true } } },
                { path: "insightHubThumbnailSmall", match: { _id: { $exists: true } } },
                { path: 'blogs', match: { _id: { $exists: true } } },
                { path: 'testimonials', match: { _id: { $exists: true } } },
                { path: 'collections', match: { _id: { $exists: true } } },
                { path: 'styles.backgroundImage', match: { _id: { $exists: true } } },
                { path: 'saleThumbnail', match: { _id: { $exists: true } } },
                { path: 'widgetImages.media', match: { _id: { $exists: true } } },
            ]).populate({
                path: 'products',
                match: { _id: { $exists: true } },
                populate: [
                    { path: 'thumbnail' },
                    { path: "productIcons", match: { _id: { $exists: true } } },
                    { path: "productTags.topRightTag", match: { _id: { $exists: true } } },
                    { path: "productTags.bottomRightTag", match: { _id: { $exists: true } } },
                    { path: "productTags.bottomLeftTag", match: { _id: { $exists: true } } },
                    { path: "productTags.topLeftTag", match: { _id: { $exists: true } } }
                ],
            }).lean()
        return {
            widgets: response,
            totalResults: count,
            page: page,
            limit: limit,
            totalPages: Math.ceil(count / limit) == 0 ? 1 : Math.ceil(count / limit),
            isLastPage: (limit * page) >= count ? true : false,
        }
    } catch (error) {
        throw error
    }
}

exports.searchDrafts = async (query, projection = {}, sort = {}, page, limit = 5) => {
    try {
        let count = await db.HomeWidgetDraft.countDocuments(query)
        let response = await db.HomeWidgetDraft.find(query, projection).limit(limit * 1).skip((page - 1) * limit).sort(sort)
            .populate([
                { path: 'collections', match: { _id: { $exists: true } } },
                { path: 'styles.backgroundImage', match: { _id: { $exists: true } } },
                { path: 'widgetImages.media', match: { _id: { $exists: true } } },
            ]).populate({
                path: 'products',
                match: { _id: { $exists: true } },
                populate: [{ path: 'category' }],
            }).lean()
        return {
            widgets: response,
            totalResults: count,
            page: page,
            limit: limit,
            totalPages: Math.ceil(count / limit) == 0 ? 1 : Math.ceil(count / limit),
            isLastPage: (limit * page) >= count ? true : false,
        }
    } catch (error) {
        throw error
    }
}

exports.searchHistory = async (query, projection = {}, sort = {}, page, limit = 5) => {
    try {
        let count = await db.HomeWidgetHistory.countDocuments(query)
        let response = await db.HomeWidgetHistory.find(query, projection).limit(limit * 1).skip((page - 1) * limit).sort(sort).populate([
            { path: 'collections', match: { _id: { $exists: true } } },
            { path: 'styles.backgroundImage', match: { _id: { $exists: true } } },
            { path: 'widgetImages.media', match: { _id: { $exists: true } } },
        ]).populate({
            path: 'products',
            match: { _id: { $exists: true } },
            populate: [{ path: 'category' }],
        }).lean()
        return {
            widgets: response,
            totalResults: count,
            page: page,
            limit: limit,
            totalPages: Math.ceil(count / limit),
            isLastPage: (limit * page) >= count ? true : false,
        }
    } catch (error) {
        throw error
    }
}

exports.searchPublished = async (query, projection = {}, sort = {}, page, limit = 5) => {
    try {
        let count = await db.HomeWidgetPublish.countDocuments(query)
        let response = await db.HomeWidgetPublish.find(query, projection).limit(limit * 1).skip((page - 1) * limit).sort(sort)
            .populate([
                { path: 'collections', match: { _id: { $exists: true } } },
                { path: 'styles.backgroundImage', match: { _id: { $exists: true } } },
                { path: 'widgetImages.media', match: { _id: { $exists: true } } },
            ]).populate({
                path: 'products',
                match: { _id: { $exists: true } },
                populate: [{ path: 'category' }],
            }).lean()
        return {
            widgets: response,
            totalResults: count,
            page: page,
            limit: limit,
            totalPages: Math.ceil(count / limit) ? 1 : Math.ceil(count / limit),
            isLastPage: (limit * page) >= count ? true : false,
        }
    } catch (error) {
        throw error
    }
}

exports.update = async (query, widget) => {
    try {
        let response = await db.HomeWidget.updateOne(query, { $set: widget }, {
            new: true, upsert: false, useFindAndModify: false
        }).exec();
        return response;
    } catch (error) {
        throw (error)
    }
}

exports.delete = async (query) => {
    try {
        let response = await db.HomeWidget.deleteOne(query)
        return response
    } catch (error) {
        throw error
    }
}

exports.deleteMany = async (query) => {
    try {
        let response = await db.HomeWidget.deleteMany(query)
        return response
    } catch (error) {
        throw error
    }
}

exports.deleteFromDraft = async (query) => {
    try {
        let response = await db.HomeWidgetDraft.deleteMany(query)
        return response
    } catch (error) {
        throw error
    }
}

exports.deleteFromHistory = async (query) => {
    try {
        let response = await db.HomeWidgetHistory.deleteMany(query)
        return response
    } catch (error) {
        throw error
    }
}

exports.deleteFromPublish = async (query) => {
    try {
        let response = await db.HomeWidgetPublish.deleteMany(query)
        return response
    } catch (error) {
        throw error
    }
}

exports.saveToDraft = async (query) => {
    try {
        let response = await db.HomeWidgetDraft.insertMany(query)
        return response
    } catch (error) {
        throw error
    }
}

exports.save = async (query) => {
    try {
        let response = await db.HomeWidget.insertMany(query)
        return response
    } catch (error) {
        throw error
    }
}

exports.saveToPublished = async (query) => {
    try {
        let response = await db.HomeWidgetPublish.insertMany(query)
        return response
    } catch (error) {
        throw error
    }
}

exports.saveToHistory = async (query) => {
    try {
        let response = await db.HomeWidgetHistory.insertMany(query)
        return response
    } catch (error) {
        throw error
    }
}