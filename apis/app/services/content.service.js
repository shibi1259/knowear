const db = require("../db")

exports.create = async (data) => {
    try {
        let response = new db.Content(data)
        await response.save()
        return response
    } catch (error) {
        throw error
    }
}

exports.find = async (query, projection) => {
    try {
        let response = await db.Content.find(query, projection)
        return response;
    } catch (error) {
        throw error
    }
}

exports.findOne = async (query, projection) => {
    try {
        let response = await db.Content.findOne(query, projection)
        return response;
    } catch (error) {
        throw error
    }
}

exports.update = async (query, data) => {
    try {
        let response = await db.Content.findOneAndUpdate(query, { $set: data }, {
            new: true,
            upsert: false,
            useFindAndModify: false
        }).exec();
        return response;
    } catch (error) {
        throw error
    }
}
