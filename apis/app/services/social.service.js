const db = require("../db")

exports.createSocial = async (data) => {
    try {
        let social = new db.Social(data)
        await social.save()
        return social
    } catch (error) {
        throw error
    }
}

exports.getAllSocial = async () => {
    try {
        let social = await db.Social.find({ isDelete: false })
        return social
    } catch (error) {
        throw error
    }
}

exports.getSocialDetails = async (query) => {
    try {
        let social = await db.Social.findOne(query)
        return social
    } catch (error) {
        throw error
    }
}
exports.getSocialMediaLinks = async () => {
    try {
        let social = await db.Social.find({ isDelete: false })
        return social
    } catch (error) {
        throw error
    }
}

exports.getSocialCount = async (query) => {
    try {
        let social = await db.Social.find(query).countDocuments()
        return social
    } catch (error) {
        throw (error)
    }
}

exports.updateSocial = async (query, data) => {
    try {
        let social = await db.Social.findOneAndUpdate(query, { $set: data }, {
            new: true,
            upsert: false,
            useFindAndModify: false
        }).exec();
        return social;
    } catch (error) {
        throw error
    }
}

exports.deleteSocial = async (slug) => {
    try {
        let social = await db.Social.findOneAndDelete({ slug: slug })
        return social
    } catch (error) {
        throw error
    }
}