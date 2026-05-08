const { months } = require('../../util/months');
const db = require('../db')

exports.create = async (data) => {
    try {
        let response = new db.NewsletterSubscibers(data)
        await response.save()
        return response;
    } catch (error) {
        throw (error)
    }
}

exports.find = async (query, projection = {}) => {
    try {
        let response = db.NewsletterSubscibers.find(query, projection)
        return response;
    } catch (error) {
        throw (error)
    }
}

exports.count = async (query) => {
    try {
        let response = db.NewsletterSubscibers.find(query).countDocuments()
        return response;
    } catch (error) {
        throw (error)
    }
}

exports.search = async (query, projection = {}, sort, page = 1, limit = 50) => {
    try {
        let items = await db.NewsletterSubscibers.find(query, projection).limit(limit * 1).skip((page - 1) * limit).sort(sort)
        let count = await db.NewsletterSubscibers.find(query).countDocuments()
        let itemDetails = []
        for (let item of items) {
            itemDetails.push({
                email: item.email,
                isVerified: item.isVerified,
                createdAt: months[new Date(item.createdAt).getMonth()] + " " + new Date(item.createdAt).getDate() + " " + new Date(item.createdAt).getFullYear()
            })
        }
        let result = {
            data: itemDetails,
            page: page,
            limit: limit,
            totalResults: count,
            totalPages: Math.ceil(count / limit) == 0 ? 1 : Math.ceil(count / limit),
            isLastPage: (limit * page) > count ? true : false,
        }
        return result;
    } catch (error) {
        throw (error)
    }
}

exports.findOne = async (query, projection = {}) => {
    try {
        let response = db.NewsletterSubscibers.findOne(query, projection)
        return response;
    } catch (error) {
        throw (error)
    }
}

exports.update = async (query, data) => {
    try {
        let response = await db.NewsletterSubscibers.updateOne(query, { $set: data }, {
            new: true,
            upsert: false,
            useFindAndModify: false
        }).exec();
        return response
    } catch (error) {
        throw (error)
    }
}