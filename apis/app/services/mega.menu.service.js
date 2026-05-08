const db = require('../db')

exports.create = async (data) => {
    try {
        let response = new db.MegaMenu(data)
        await response.save()
        return response;
    } catch (error) {
        throw (error)
    }
}

exports.find = async (query, projection = {}) => {
    try {
        let response = db.MegaMenu.find(query, projection).sort({ index: 1 })
        return response;
    } catch (error) {
        throw (error)
    }
}

exports.findOne = async (query, projection = {}) => {
    try {
        let response = db.MegaMenu.findOne(query, projection)
        return response;
    } catch (error) {
        throw (error)
    }
}

exports.update = async (query, data) => {
    try {
        let response = await db.MegaMenu.findOneAndUpdate(query, { $set: data }, {
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
        const response = await db.MegaMenu.deleteOne(query)
        return response
    } catch (error) {
        throw error;
    }
}