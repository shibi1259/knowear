const db = require("../db")

exports.createGuest = async (data) => {
    try {
        let guest = new db.Guest(data)
        await guest.save()
        return guest;
    } catch (error) {
        throw (error);
    }
}

exports.count = async (query) => {
    try {
        let guest = await db.Guest.find(query).countDocuments()
        return guest;
    } catch (error) {
        throw (error);
    }
}

exports.getGuestDetails = async (query) => {
    try {
        let guest = await db.Guest.findOne(query)

        return guest;
    } catch (error) {
        throw (error);
    }
}
exports.findGuestById = async (objectId) => {
    try {
        let guest = await db.Guest.findById(objectId)

        return guest;
    } catch (error) {
        throw (error);
    }
}

exports.getGuests = async (query) => {
    try {
        let guests = await db.Guest.find(query)
        return guests;
    } catch (error) {
        return error
    }
}

exports.updateGuest = async (query, data) => {
    try {
        let guest = await db.Guest.findOneAndUpdate(query, { $set: data }, {
            new: true,
            upsert: false,
            useFindAndModify: false
        }).exec()
        return guest
    }
    catch (error) {
        throw error
    }
}