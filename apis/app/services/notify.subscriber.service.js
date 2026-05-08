const { BASE_URL } = require('../../config/constants/common');
const db = require('../db')

exports.create = async (data) => {
    try {
        let response = new db.NotifySubscribers(data)
        await response.save()
        return response;
    } catch (error) {
        throw (error)
    }
}

exports.find = async (query, projection = {}) => {
    try {
        let response = await db.NotifySubscribers.find(query, projection)
            .populate('customer').populate('product').sort({ createdAt: -1 })
        return response;
    } catch (error) {
        throw (error)
    }
}

exports.count = async (query) => {
    try {
        let response = await db.NotifySubscribers.find(query).countDocuments()
        return response;
    } catch (error) {
        throw (error)
    }
}

exports.findOne = async (query, projection = {}) => {
    try {
        let response = await db.NotifySubscribers.findOne(query, projection).populate('customer').populate('product')
        return response;
    } catch (error) {
        throw (error)
    }
}

exports.search = async (query, page, limit, projection = {}, sort = {}) => {
    try {
        let subscribers = await db.NotifySubscribers.find(query, projection)
            .limit(limit * 1).skip((page - 1) * limit)
            .populate('customer', 'name userid email')
            .populate('guest', 'name refid')
            .populate('product', 'name thumbnail prodid slug').sort(sort)
        let count = await db.NotifySubscribers.find(query).countDocuments()
        let subscribedDetails = []
        for (let subscriber of subscribers) {
            subscribedDetails.push({
                name: subscriber?.customer ? subscriber?.customer?.name : subscriber?.guest?.name,
                product: {
                    name: subscriber?.product?.name,
                    thumbnail: BASE_URL + subscriber?.product?.thumbnail,
                },
                refid: subscriber?.refid,
            })
        }
        let result = {
            data: subscribedDetails,
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

exports.update = async (query, data) => {
    try {
        let response = await db.NotifySubscribers.findOneAndUpdate(query, { $set: data }, {
            new: true,
            upsert: false,
            useFindAndModify: false
        }).exec();
        return response
    } catch (error) {
        throw (error)
    }
}