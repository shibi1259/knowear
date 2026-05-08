const db = require('../db')

exports.create = async (data) => {
    try {
        let response = new db.Media(data)
        await response.save()
        return response;
    } catch (error) {
        console.log(error)
    }
}

exports.find = async (query, projection = {}) => {
    try {
        let response = db.Media.find(query, projection)
        return response;
    } catch (error) {
        throw (error)
    }
}

exports.count = async (query) => {
    try {
        let response = db.Media.find(query).countDocuments()
        return response;
    } catch (error) {
        throw (error)
    }
}

exports.findOne = async (query, projection = {}) => {
    try {
        let response = db.Media.findOne(query, projection).populate('uploadedBy', 'firstname lastname email username refid slug')   
        return response;
    } catch (error) {
        throw (error)
    }
}

exports.findById = async (id) => {
    try {
        let response = db.Media.findById(id)
        return response;
    } catch (error) {
        throw (error)
    }
}

exports.search = async (query, projection = {}, sort, page = 1, limit = 50) => {
    try {
        let medias = await db.Media.find(query, projection).limit(limit * 1).skip((page - 1) * limit).sort(sort).populate('uploadedBy', 'firstname lastname email');
        let count = await db.Media.find(query).countDocuments()
        let result = {
            data: medias,
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
        let response = await db.Media.findOneAndUpdate(query, { $set: data }, {
            new: true,
            upsert: false,
            useFindAndModify: false
        }).exec();
        return response
    } catch (error) {
        throw (error)
    }
}

exports.delete = async (query) => {
    try {
        let response = await db.Media.deleteOne(query);
        return response
    } catch (error) {
        throw (error)
    }
}