const db = require('../db')

exports.create = async (objNotification) => {
    try {
        let response = new db.Notification(objNotification)
        await response.save()
        return response;
    } catch (error) {
        throw (error)
    }
}

exports.findOne = async (query, projection = {}) => {
    try {
        let response = db.Notification.findOne(query, projection)
            .populate([
                { path: "thumbnail", match: { _id: { $exists: true } } },
                { path: "customers", match: { _id: { $exists: true } } }
            ]);
        return response;
    } catch (error) {
        throw (error)
    }
}

exports.find = async (query, projection = {}, sort = { createdAt: -1 }) => {
    try {
        let response = db.Notification.find(query, projection).sort(sort)
            .populate([
                { path: "thumbnail", match: { _id: { $exists: true } } },
                { path: "customers", match: { _id: { $exists: true } } }
            ]);
        return response;
    } catch (error) {
        throw (error)
    }
}

exports.search = async (query, page, limit, projection = {}, sort = {}) => {
    try {
        let notifications = await db.Notification.find(query, projection)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 })
            .populate([
                { path: "thumbnail", match: { _id: { $exists: true } } },
                { path: "customers", match: { _id: { $exists: true } } }
            ]);

        let count = await db.Notification.find(query).countDocuments()
        let totalCount = await db.Notification.find({ isDelete: false }).countDocuments()
        let sentCount = await db.Notification.find({ status: "sent", isDelete: false }).countDocuments()
        let pendingCount = await db.Notification.find({ status: "pending", isDelete: false }).countDocuments()
        let rejectedCount = await db.Notification.find({ status: "rejected", isDelete: false }).countDocuments()

        let result = {
            data: notifications,
            counts: {
                total: totalCount,
                sent: sentCount,
                rejected: rejectedCount,
                pending: pendingCount,
            },
            page: page,
            limit: limit,
            totalPages: Math.ceil(count / limit) == 0 ? 1 : Math.ceil(count / limit),
            totalResults: count,
            isLastPage: (limit * page) > count ? true : false,
        }
        return result;
    } catch (error) {
        throw error;
    }
}

exports.update = async (query, data) => {
    try {
        let response = await db.Notification.updateOne(query, { $set: data }, {
            new: true,
            upsert: false,
            useFindAndModify: false
        }).exec();
        return response;
    } catch (error) {
        throw (error)
    }
}