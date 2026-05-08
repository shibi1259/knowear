const db = require("../db")

exports.add = async (data) => {
    try {
        let response = new db.Catalog(data)
        await response.save()
        return response
    } catch (error) {
        throw error
    }
}

exports.find = async (query, projection = {}) => {
    try {
        let response = await db.Catalog.find(query, projection).sort({ createdAt: -1 })
        return response
    } catch (error) {
        throw error
    }
}

exports.count = async (query) => {
    try {
        let response = await db.Catalog.find(query).countDocuments()
        return response
    } catch (error) {
        throw error
    }
}

exports.search = async (query, projection = {}, page = 1, limit = 50) => {
    try {
        let catalogs = await db.Catalog.find(query, projection).limit(limit * 1).skip((page - 1) * limit).sort({ createdAt: -1 }).populate('admin', 'firstname lastname email');
        let count = await db.Catalog.find(query).countDocuments()
        let result = {
            data: catalogs,
            totalResults: count,
            page: page,
            limit: limit,
            totalPages: Math.ceil(count / limit),
            lastPage: (limit * page) > count ? true : false,
        }
        return result;
    } catch (error) {
        throw (error)
    }
}

exports.findOne = async (query, projection) => {
    try {
        let response = await db.Catalog.findOne(query, projection)
        return response
    } catch (error) {
        throw error
    }
}

exports.update = async (query, data) => {
    try {
        let response = await db.Catalog.updateOne(query, { $set: data }, {
            new: true, upsert: false,
            useFindAndModify: false
        }).exec();
        return response;
    } catch (error) {
        throw error
    }
}

exports.delete = async (query) => {
    try {
        let response = await db.Catalog.deleteOne(query)
        return response
    } catch (error) {
        throw error
    }
}