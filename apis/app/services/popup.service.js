const db = require('../db')

exports.create = async (data) => {
    try {
        let response = new db.Popup(data)
        await response.save()
        return response;
    } catch (error) {
        throw (error)
    }
}

exports.findOne = async (query) => {
    try {
        let response = db.Popup.findOne(query).populate([
            { path: 'website', match: { _id: { $exists: true } } },
            { path: 'mobile', match: { _id: { $exists: true } } },
            { path: 'app', match: { _id: { $exists: true } } }
        ])
        return response;
    } catch (error) {
        throw (error)
    }
}

exports.update = async (query, data) => {
    try {
        let response = await db.Popup.updateOne(query, { $set: data }, {
            new: true,
            upsert: false,
            useFindAndModify: false
        }).exec();
        return response
    } catch (error) {
        throw (error)
    }
}