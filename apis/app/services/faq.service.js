const db = require('../db')

exports.create = async (objFaq) => {
    try {
        let response = new db.Faq(objFaq)
        await response.save()
        return response
    } catch (error) {
        throw (error)
    }
}

exports.find = async (query, projection = {}) => {
    try {
        let response = await db.Faq.find(query, projection)
        return response;
    } catch (error) {
        throw (error)
    }
}

exports.findOne = async (query, projection = {}) => {
    try {
        let response = db.Faq.findOne(query, projection)
        return response;
    } catch (error) {
        throw (error)
    }
}

exports.update = async (query, objFaq) => {
    try {
        let response = await db.Faq.findOneAndUpdate(query, { $set: objFaq }, {
            new: true,
            upsert: false,
            useFindAndModify: false
        }).exec();
        return response
    } catch (error) {
        throw (error)
    }
}