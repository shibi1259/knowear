const db = require('../db')

exports.create = async (objPermission) => {
    try {
        let response = new db.PaymentDetails(objPermission);
        await response.save();
        return response;
    } catch (error) {
        throw error;
    }
}


exports.findOne = async (query) => {
    try {
        let response = await db.PaymentDetails.findOne(query).populate('displayIcon');
        return response;
    } catch (error) {
        throw error;
    }
}

exports.find = async (query, projection = {}) => {
    try {
        let response = await db.PaymentDetails.find(query, projection).populate('displayIcon');
        return response;
    } catch (error) {
        throw error;
    }
}

exports.update = async (query, data) => {
    try {
        const respone = await db.PaymentDetails.updateOne(query, { $set: data }, {
            new: true,
            upsert: false,
            useFindAndModify: false
        }).exec();
        return respone;
    } catch (error) {
        throw error;
    }
};
