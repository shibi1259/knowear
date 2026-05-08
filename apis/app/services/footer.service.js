const db = require('../db')

exports.create = async (data) => {
    try {
        return await db.Footer.create(data)
    } catch (error) {
        return error
    }
}

exports.findOne = async (query) => {
    try {
        const footer = await db.Footer.findOne(query)
        return footer;
    } catch (error) {
        return error
    }
}

exports.update = async (query, data) => {
    try {
        return await db.Footer.findOneAndUpdate(query, data)
    } catch (error) {
        return error
    }
}