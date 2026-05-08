const { months } = require('../../util/months');
const db = require('../db')

exports.create = async (data) => {
    try {
        let response = new db.BannerImage(data)
        await response.save()
        return response;
    } catch (error) {
        throw (error)
    }
}

exports.find = async (query, projection = {}) => {
    try {
        let response = db.BannerImage.find(query, projection).populate('media').sort({ createdAt: -1 })
        return response;
    } catch (error) {
        throw (error)
    }
}

exports.count = async (query) => {
    try {
        let response = db.BannerImage.find(query).countDocuments()
        return response;
    } catch (error) {
        throw (error)
    }
}

exports.search = async (query, projection = {}, sort, page = 1, limit = 50) => {
    try {
        let items = await db.BannerImage.find(query, projection).limit(limit * 1).skip((page - 1) * limit).sort(sort).populate('media')
        let count = await db.BannerImage.find(query).countDocuments()
        let result = {
            data: items,
            page: page,
            limit: limit,
            totalResults: count,
            totalPages: Math.ceil(count / limit),
            isLastPage: (limit * page) > count ? true : false,
        }
        return result;
    } catch (error) {
        throw (error)
    }
}

exports.findOne = async (query, projection = {}) => {
    try {
        let response = db.BannerImage.findOne(query, projection).populate('media')
        return response;
    } catch (error) {
        throw (error)
    }
}

exports.update = async (query, data) => {
    try {
        let response = await db.BannerImage.updateOne(query, { $set: data }, {
            new: true,
            upsert: false,
            useFindAndModify: false
        }).exec();
        return response
    } catch (error) {
        throw (error)
    }
}