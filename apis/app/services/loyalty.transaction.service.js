const { months } = require('../../util/months');
const db = require('../db')

exports.create = async (data) => {
    try {
        let response = new db.LoyaltyTransaction(data)
        await response.save()
        return response;
    } catch (error) {
        throw (error)
    }
}

exports.find = async (query, projection = {}) => {
    try {
        let response = db.LoyaltyTransaction.find(query, projection)
            .populate('user', 'name mobile countryCode email userid slug loyaltyPoints').sort({ createdAt: -1 })
        return response;
    } catch (error) {
        throw (error)
    }
}

exports.count = async (query) => {
    try {
        let response = db.LoyaltyTransaction.find(query).countDocuments()
        return response;
    } catch (error) {
        throw (error)
    }
}

exports.search = async (query, projection = {}, sort, page = 1, limit = 50) => {
    try {
        let loyaltyTransactions = []
        let items = await db.LoyaltyTransaction.find(query, projection).limit(limit * 1).skip((page - 1) * limit).sort(sort)
        let count = await db.LoyaltyTransaction.find(query).countDocuments()
        for (let item of items) {
            loyaltyTransactions.push({
                message: item.type == 'credit' ? 'points added' : 'points removed',
                description: item.description,
                points: item.points,
                type: item.type,
                status: item.status,
                transactionDate: `${months[new Date(item.createdAt).getMonth()]} ${new Date(item.createdAt).getDate()} ${new Date(item.createdAt).getFullYear()}, ${new Date(item.createdAt).toLocaleTimeString()}`,
            })
        }
        let result = {
            data: loyaltyTransactions,
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
        let response = db.LoyaltyTransaction.findOne(query, projection)
            .populate('user', 'name mobile countryCode email userid slug')
            .populate('user', 'email slug')
        return response;
    } catch (error) {
        throw (error)
    }
}

exports.update = async (query, data) => {
    try {
        let response = await db.LoyaltyTransaction.updateOne(query, { $set: data }, {
            new: true,
            upsert: false,
            useFindAndModify: false
        }).exec();
        return response
    } catch (error) {
        throw (error)
    }
}