const db = require('../db')

exports.create = async (data) => {
    try {
        let response = new db.FileImport(data)
        await response.save()
        return response;
    } catch (error) {
        throw (error)
    }
}

exports.find = async (obj, projection = {}) => {
    try {
        let response = db.FileImport.find(obj, projection)
        return response;
    } catch (error) {
        throw (error)
    }
}

exports.search = async (query, projection = {}, sort, page = 1, limit = 50) => {
    try {
        let fileImports = await db.FileImport.find(query, projection).limit(limit * 1).skip((page - 1) * limit).sort(sort).populate('createdBy', 'email');
        let count = await db.FileImport.find(query).countDocuments()
        let result = {
            data: fileImports,
            totalResults: count,
            page: page,
            limit: limit,
            totalPages: Math.ceil(count / limit) == 0 ? 1 : Math.ceil(count / limit),
            isLastPage: (limit * page) > count ? true : false,
        }
        return result;
    } catch (error) {
        throw (error)
    }
}

exports.count = async (obj) => {
    try {
        let response = db.FileImport.find(obj).countDocuments()
        return response;
    } catch (error) {
        throw (error)
    }
}

exports.findOne = async () => {
    try {
        let response = db.FileImport.findOne({ isDelete: false })
        return response;
    } catch (error) {
        throw (error)
    }
}

exports.update = async (query, data) => {
    try {
        let response = await db.FileImport.updateOne(query, { $set: data }, {
            new: true,
            upsert: false,
            useFindAndModify: false
        }).exec();
        return response
    } catch (error) {
        throw (error)
    }
}