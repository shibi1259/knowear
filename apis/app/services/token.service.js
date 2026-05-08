const db = require('../db')

exports.create = async (data) => {
    try {
        let token = new db.TokenDetails(data)
        await token.save();
        return token
    } catch (error) {
        throw (error)
    }
}

exports.findOne = async (query, projection = {}) => {
    try {
        let token = await db.TokenDetails.findOne(query, projection)
        return token
    } catch (error) {
        throw (error)
    }
}

exports.count = async (query) => {
    try {
        let token = await db.TokenDetails.find(query).countDocuments()
        return token
    } catch (error) {
        throw (error)
    }
}

exports.findAll = async (query, projection = {}) => {
    try {
        let token = await db.TokenDetails.find(query, projection)
        return token
    } catch (error) {
        throw (error)
    }
}

exports.update = async (query, data) => {
    try {
        let token = await db.TokenDetails.findOneAndUpdate(query, { $set: data }, {
            new: true,
            upsert: false,
            useFindAndModify: false
        }).exec();
        return token
    } catch (error) {
        throw (error)
    }
}