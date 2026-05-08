const db = require("../db")

exports.add = async (data) => {
    try {
        let response = new db.Enquiry(data)
        await response.save()
        return response
    } catch (error) {
        throw error
    }
}

exports.find = async (query, projection) => {
    try {
        let response = await db.Enquiry.find(query, projection)
        return response
    } catch (error) {
        throw error
    }
}

exports.search = async (query, page, limit, projection = {}) => {
    try {
        let response = await db.Enquiry.find(query, projection).limit(limit * 1).skip((page - 1) * limit).sort({ createdAt: -1 })
        let count = await db.Enquiry.find(query).countDocuments()
        let result = {
            page: page,
            limit: limit,
            data: response,
            totalPages: Math.ceil(count / limit) == 0 ? 1 : Math.ceil(count / limit),
            lastPage: (limit * page) > count ? true : false,
            totalResults: count
        }
        return result
    } catch (error) {
        throw error
    }
}

exports.count = async (query) => {
    try {
        let response = await db.Enquiry.find(query).countDocuments()
        return response
    } catch (error) {
        throw error
    }
}

exports.findOne = async (query, projection) => {
    try {
        let response = await db.Enquiry.findOne(query, projection)
        return response
    } catch (error) {
        throw error
    }
}

exports.update = async (query, data) => {
    try {
        let response = await db.Enquiry.findOneAndUpdate(query, { $set: data }, {
            new: true,
            upsert: false,
            useFindAndModify: false
        }).exec();
        return response;
    } catch (error) {
        throw error
    }
}