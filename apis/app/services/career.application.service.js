const { CareerApplication } = require("../db");

exports.create = async (data) => {
    try {
        let response = new CareerApplication(data)
        await response.save()
        return response;
    } catch (error) {
        throw (error)
    }
}

exports.find = async (obj, projection = {}) => {
    try {
        let response = CareerApplication.find(obj, projection)
        return response;
    } catch (error) {
        throw (error)
    }
}

exports.findOne = async (query, projection = {}) => {
    try {
        let response = CareerApplication.findOne(query, projection)
        return response;
    } catch (error) {
        throw (error)
    }
}

exports.search = async (query, page = 1, limit = 20, projection = {}) => {
    try {
        let count = await CareerApplication.find(query).countDocuments()
        let response = await CareerApplication.find(query, projection)
            .limit(limit * 1).skip((page - 1) * limit).sort({ createdAt: -1 });
        return {
            data: response,
            page: page,
            totalResults: count,
            limit: limit,
            totalPages: Math.ceil(count / limit) == 0 ? 1 : Math.ceil(count / limit),
            isLastPage: (limit * page) > count ? true : false,
        }
    } catch (error) {
        throw (error);
    }
}
exports.update = async (query, data) => {
    try {
        let response = await CareerApplication.findOneAndUpdate(query, { $set: data }, {
            new: true,
            upsert: false,
            useFindAndModify: false
        }).exec();
        return response
    } catch (error) {
        throw (error)
    }
}