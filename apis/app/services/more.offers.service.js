const { months } = require('../../util/months');
const db = require('../db')

exports.create = async (data) => {
    try {
        let response = new db.MoreOffers(data)
        await response.save()
        return response;
    } catch (error) {
        throw (error)
    }
}

exports.find = async (query, projection = {}) => {
    try {
        let response = db.MoreOffers.find(query, projection)
            .populate([
                { path: 'appliedCategory', match: { _id: { $exists: true } } },
                { path: 'appliedProduct', match: { _id: { $exists: true } } },
                { path: 'appliedBrand', match: { _id: { $exists: true } } },
                { path: 'applicableCategory', match: { _id: { $exists: true } } },
                { path: 'applicableProduct', match: { _id: { $exists: true } } },
                { path: 'applicableBrand', match: { _id: { $exists: true } } },
                { path: 'thumbnail', match: { _id: { $exists: true } } }
            ])
        return response;
    } catch (error) {
        throw (error)
    }
}

exports.count = async (query) => {
    try {
        let response = db.MoreOffers.find(query).countDocuments()
        return response;
    } catch (error) {
        throw (error)
    }
}

exports.search = async (query, projection = {}, sort, page = 1, limit = 50) => {
    try {
        let items = await db.MoreOffers.find(query, projection).limit(limit * 1).skip((page - 1) * limit).sort(sort)
            .populate([
                { path: 'appliedCategory', match: { _id: { $exists: true } } },
                { path: 'appliedProduct', match: { _id: { $exists: true } } },
                { path: 'appliedBrand', match: { _id: { $exists: true } } },
                { path: 'applicableCategory', match: { _id: { $exists: true } } },
                { path: 'applicableProduct', match: { _id: { $exists: true } } },
                { path: 'applicableBrand', match: { _id: { $exists: true } } },
                { path: 'thumbnail', match: { _id: { $exists: true } } }
            ])
        let count = await db.MoreOffers.find(query).countDocuments()
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
        let response = db.MoreOffers.findOne(query, projection)
            .populate([
                { path: 'appliedCategory', match: { _id: { $exists: true } } },
                { path: 'appliedProduct', match: { _id: { $exists: true } } },
                { path: 'appliedBrand', match: { _id: { $exists: true } } },
                { path: 'applicableCategory', match: { _id: { $exists: true } } },
                { path: 'applicableProduct', match: { _id: { $exists: true } } },
                { path: 'applicableBrand', match: { _id: { $exists: true } } },
                { path: 'thumbnail', match: { _id: { $exists: true } } }
            ])
        return response;
    } catch (error) {
        throw (error)
    }
}

exports.update = async (query, data) => {
    try {
        let response = await db.MoreOffers.updateOne(query, { $set: data }, {
            new: true,
            upsert: false,
            useFindAndModify: false
        }).exec();
        return response
    } catch (error) {
        throw (error)
    }
}