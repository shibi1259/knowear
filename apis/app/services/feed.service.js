const db = require('../db')

exports.create = async (data) => {
    try {
        let response = new db.Feed(data)
        await response.save()
        return response;
    } catch (error) {
        throw (error)
    }
}

exports.find = async (obj, projection = {}) => {
    try {
        let response = db.Feed.find(obj, projection)
        return response;
    } catch (error) {
        throw (error)
    }
}

exports.count = async (obj) => {
    try {
        let response = db.Feed.find(obj).countDocuments()
        return response;
    } catch (error) {
        throw (error)
    }
}

exports.findOne = async () => {
    try {
        let response = db.Feed.findOne({ isDelete: false })
        return response;
    } catch (error) {
        throw (error)
    }
}

exports.update = async (query, data) => {
    try {
        let response = await db.Feed.findOneAndUpdate(query, { $set: data }, {
            new: true,
            upsert: false,
            useFindAndModify: false
        }).exec();
        return response
    } catch (error) {
        throw (error)
    }
}