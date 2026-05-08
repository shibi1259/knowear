const db = require('../db')

exports.create = async (data) => {
    try {
        let response = new db.Activity(data)
        await response.save()
        return response;
    } catch (error) {
        throw (error)
    }
}

exports.find = async (query) => {
    try {
        let response = db.Activity.find(query).sort({ createdAt: -1 }).populate('admin', 'name email')
        return response;
    } catch (error) {
        throw (error)
    }
}

exports.search = async (query, projection = {}, page = 1, limit = 50) => {
    try {
        let activities = await db.Activity.find(query, projection).limit(limit * 1).skip((page - 1) * limit).sort({ createdAt: -1 }).populate('admin', 'firstname lastname email');
        let count = await db.Activity.find(query).countDocuments()
        let result = {
            data: activities,
            totalResults: count,
            page: page,
            limit: limit,
            totalPages: Math.ceil(count / limit) == 0 ? 1 : Math.ceil(count / limit),
            lastPage: (limit * page) > count ? true : false,
        }
        return result;
    } catch (error) {
        throw (error)
    }
}

exports.count = async (query) => {
    try {
        let response = db.Activity.find(query).countDocuments()
        return response;
    } catch (error) {
        throw (error)
    }
}

exports.findOne = async (query) => {
    try {
        let response = db.Activity.findOne(query).populate('admin', 'name email')
        return response;
    } catch (error) {
        throw (error)
    }
}

exports.update = async (query, data) => {
    try {
        let response = await db.Activity.updateOne(query, { $set: data }, {
            new: true,
            upsert: false,
            useFindAndModify: false
        }).exec();
        return response
    } catch (error) {
        throw (error)
    }
}