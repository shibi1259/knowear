const db = require('../db')

exports.create = async (data) => {
    try {
        let response = new db.SeoDetails(data)
        await response.save()
        return response;
    } catch (error) {
        throw (error)
    }
}

exports.find = async (obj, projection = {}) => {
    try {
        let response = db.SeoDetails.find(obj, projection).sort({ createdAt: -1 }).populate('thumbnail')
        return response;
    } catch (error) {
        throw (error)
    }
}

exports.count = async (query) => {
    try {
        let response = db.SeoDetails.find(query).countDocuments()
        return response;
    } catch (error) {
        throw (error)
    }
}

exports.findOne = async (query, projection = {}) => {
    try {
        let response = db.SeoDetails.findOne(query, projection).populate('thumbnail')
        return response;
    } catch (error) {
        throw (error)
    }
}

exports.update = async (query, data) => {
    try {
        let response = await db.SeoDetails.findOneAndUpdate(query, { $set: data }, {
            new: true,
            upsert: false,
            useFindAndModify: false
        }).exec();
        return response
    } catch (error) {
        throw (error)
    }
}