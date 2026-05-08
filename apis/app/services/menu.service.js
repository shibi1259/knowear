const db = require('../db')

exports.create = async (data) => {
    try {
        let response = new db.Menu(data)
        await response.save()
        return response;
    } catch (error) {
        throw (error)
    }
}

exports.find = async (query, projection = {}) => {
    try {
        let response = db.Menu.find(query, projection).populate([
            { path: 'icon', match: { _id: { $exists: true } } }
        ]).sort({ index: 1 })
        return response;
    } catch (error) {
        throw (error)
    }
}

exports.count = async (query) => {
    try {
        let response = db.Menu.find(query).countDocuments()
        return response;
    } catch (error) {
        throw (error)
    }
}

exports.findOne = async (query, projection = {}) => {
    try {
        let response = db.Menu.findOne(query, projection).populate([
            { path: 'icon', match: { _id: { $exists: true } } }
        ])
        return response;
    } catch (error) {
        throw (error)
    }
}

exports.update = async (query, data) => {
    try {
        let response = await db.Menu.findOneAndUpdate(query, { $set: data }, {
            new: true,
            upsert: false,
            useFindAndModify: false
        }).exec();
        return response
    } catch (error) {
        throw (error)
    }
}