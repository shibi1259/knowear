const db = require('../db')

exports.create = async (objHelpCenter) => {
    try {
        let response = new db.HelpCenter(objHelpCenter)
        await response.save()
        return response;
    } catch (error) {
        throw (error)
    }
}

exports.getHelpCenter = async (obj, projection = {}) => {
    try {
        let helpcenter = db.HelpCenter.find(obj, projection)
        return helpcenter;
    } catch (error) {
        throw (error)
    }
}

exports.findOne = async () => {
    try {
        let response = await db.HelpCenter.findOne({ refid: '1' })
        return response;
    } catch (error) {
        throw (error)
    }
}

exports.update = async (query, data) => {
    try {
        let helpcenter = await db.HelpCenter.findOneAndUpdate(query, { $set: data }, {
            new: true,
            upsert: false,
            useFindAndModify: false
        }).exec();
        return helpcenter
    } catch (error) {
        throw (error)
    }
}