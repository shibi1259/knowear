const db = require("../db")

exports.add = async (data) => {
    try {
        let response = new db.DeliverySlots(data)
        await response.save()
        return response
    } catch (error) {
        throw error
    }
}

exports.find = async (query, projection) => {
    try {
        let response = await db.DeliverySlots.find(query, projection);
        return response;
    } catch (error) {
        throw error
    }
}

exports.rawFind = async (query, projection) => {
    try {
        let response = await db.DeliverySlots.find(query, projection).sort({ from: 1 });
        return response;
    } catch (error) {
        throw error
    }
}

exports.aggregate = async (query) => {
    try {
        let response = await db.DeliverySlots.aggregate(query)
        return response
    } catch (error) {
        throw error
    }
}

exports.count = async (query) => {
    try {
        let response = await db.DeliverySlots.find(query).countDocuments()
        return response
    } catch (error) {
        throw error
    }
}

exports.findOne = async (query, projection) => {
    try {
        let response = await db.DeliverySlots.findOne(query, projection)
        return response
    } catch (error) {
        throw error
    }
}

exports.update = async (query, data) => {
    try {
        let response = await db.DeliverySlots.findOneAndUpdate(query, { $set: data }, {
            new: true,
            upsert: false,
            useFindAndModify: false
        }).exec();
        return response;
    } catch (error) {
        throw error
    }
}