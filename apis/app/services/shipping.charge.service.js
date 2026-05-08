const db = require('../db')

exports.create = async (data) => {
    try {
        let response = new db.ShippingCharge(data)
        await response.save()
        return response;
    } catch (error) {
        throw (error)
    }
}

exports.findOne = async (query, projection = {}) => {
    try {
        let response = db.ShippingCharge.findOne(query, projection)
        return response;
    } catch (error) {
        throw (error)
    }
}

exports.find = async (query, projection = {}) => {
    try {
        let response = db.ShippingCharge.find(query, projection).sort({ createdAt: -1 })
        return response;
    } catch (error) {
        throw (error)
    }
}

exports.search = async (query, projection = {}, page = 1, limit = 50) => {
    try {
        let response = await db.ShippingCharge.find(query, projection).limit(limit * 1).skip((page - 1) * limit).sort({ createdAt: -1 })
        let count = await db.ShippingCharge.find(query).countDocuments()
        let result = {
            data: response,
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

exports.update = async (query, data) => {
    try {
        let response = await db.ShippingCharge.updateOne(query, { $set: data }, {
            new: true,
            upsert: false,
            useFindAndModify: false
        }).exec();
        return response
    } catch (error) {
        throw (error)
    }
}