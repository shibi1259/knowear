const db = require('../db')

exports.create = async (objTestimonial) => {
    try {
        let response = new db.PageCovers(objTestimonial)
        await response.save()
        return response
    } catch (error) {
        throw (error)
    }
}

exports.find = async (query, projection = {}) => {
    try {
        let response = await db.PageCovers.find(query, projection).sort({ createdAt: -1 }).populate([
            { path: 'desktopCover', match: { _id: { $exists: true } } },
            { path: 'mobileCover', match: { _id: { $exists: true } } },
        ]);
        return response;
    } catch (error) {
        throw (error)
    }
}

exports.findOne = async (query, projection = {}) => {
    try {
        let response = await db.PageCovers.findOne(query, projection).populate([
            { path: 'desktopCover', match: { _id: { $exists: true } } },
            { path: 'mobileCover', match: { _id: { $exists: true } } },
        ]);
        return response;
    } catch (error) {
        throw (error)
    }
}

exports.update = async (query, data) => {
    try {
        let response = await db.PageCovers.updateOne(query, { $set: data }, {
            new: true,
            upsert: false,
            useFindAndModify: false
        }).exec();
        return response
    } catch (error) {
        throw (error)
    }
}