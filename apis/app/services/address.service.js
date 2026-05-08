const db = require('../db')

exports.add = async (data) => {
    try {
        let address = new db.Address(data)
        await address.save()
        return address;
    } catch (error) {
        throw (error)
    }
}

exports.find = async (query, projection = {}) => {
    try {
        let address = db.Address.find(query, projection)
        return address;
    } catch (error) {
        throw (error)
    }
}

exports.findOne = async (query, projection = {}) => {
    try {
        let address = db.Address.findOne(query, projection)
        return address;
    } catch (error) {
        throw (error)
    }
}

exports.count = async (query) => {
    try {
        let address = db.Address.find(query).countDocuments()
        return address;
    } catch (error) {
        throw (error)
    }
}

exports.update = async (query, data) => {
    try {
        let address = await db.Address.findOneAndUpdate(query, { $set: data }, {
            new: true,
            upsert: false,
            useFindAndModify: false
        }).exec();
        return address
    } catch (error) {
        throw (error)
    }
}

exports.updateMany = async (query, data) => {
    try {
        let address = await db.Address.updateMany(query, { $set: data }, {
            new: true,
            upsert: false,
            useFindAndModify: false
        }).exec();
        return address
    } catch (error) {
        throw (error)
    }
}