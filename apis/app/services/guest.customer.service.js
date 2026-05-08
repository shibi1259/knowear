const db = require('../db')
const { months } = require('../../util/months')

exports.create = async (data) => {
    try {
        let response = new db.GuestCustomer(data)
        await response.save()
        return response;
    } catch (error) {
        throw (error)
    }
}

exports.find = async (query, projection = {}) => {
    try {
        let response = await db.GuestCustomer.find(query, projection)
        return response;
    } catch (error) {
        throw (error)
    }
}
exports.findGuestById = async (objectId) => {
    try {
        let response = await db.GuestCustomer.findById(objectId)
        return response;
    } catch (error) {
        throw (error)
    }
}

exports.search = async (query, projection = {}, sort, page = 1, limit = 50) => {
    try {
        let response = await db.GuestCustomer.find(query, projection).limit(limit * 1).skip((page - 1) * limit).sort(sort).populate('createdBy', 'email');
        let count = await db.GuestCustomer.find(query).countDocuments()
        let guests = []
        for (let guest of response) {
            guests.push({
                name: guest.firstname + ' ' + guest.lastname || '',
                email: guest.email,
                countryCode: guest.countryCode,
                mobile: guest.mobile,
                token: guest.token,
                status: guest.status == 'registered' ? 'registered' : 'Unregistered',
                createdAt: `${months[new Date(guest.createdAt).getMonth()]} ${new Date(guest.createdAt).getDate()} ${new Date(guest.createdAt).getFullYear()}`
            })
        }
        let result = {
            data: guests,
            totalResults: count,
            page: page,
            limit: limit,
            totalPages: Math.ceil(count / limit) == 0 ? 1 : Math.ceil(count / limit),
            isLastPage: (limit * page) > count ? true : false,
        }
        return result;
    } catch (error) {
        throw (error)
    }
}

exports.findOne = async (query, projection = {}) => {
    try {
        let response = await db.GuestCustomer.findOne(query, projection)
        return response;
    } catch (error) {
        throw (error)
    }
}

exports.update = async (query, data) => {
    try {
        let response = await db.GuestCustomer.findOneAndUpdate(query, { $set: data }, {
            new: true,
            upsert: false,
            useFindAndModify: false
        }).exec();
        return response
    } catch (error) {
        throw (error)
    }
}