const db = require("../db")

exports.createOrderReport = async (objOrderReport) => {
    try {
        let orderReport = new db.OrderReport(objOrderReport)
        await orderReport.save()
        return orderReport;
    } catch (error) {
        throw error
    }
}

exports.getAllOrderReport = async () => {
    try {
        let orderReport = await db.OrderReport.find({ isDelete: false })
            .populate({
                path: 'order',
                select: 'orderNo orderStatus orderDate tax total shippingCost paymentMethod product',
                model: 'orders',
                populate: {
                    path: 'customerId',
                    select: 'firstname email mobile',
                    model: 'customers'
                }
            })
        return orderReport;
    } catch (error) {
        throw (error)
    }
}

exports.getActiveOrderReport = async (obj, projection = {}) => {
    try {
        let orderReport = await db.OrderReport.find(obj, projection)
            .populate({
                path: 'order',
                select: 'orderNo orderStatus orderDate tax total shippingCost paymentMethod product',
                model: 'orders',
                populate: {
                    path: 'customerId',
                    select: 'firstname email mobile',
                    model: 'customers'
                }
            })
        return orderReport;
    } catch (error) {
        throw error
    }
}

exports.updateOrderReport = async (id, objOrderReport) => {
    try {
        let orderReport = await db.OrderReport.findOneAndUpdate({ _id: id }, { $set: objOrderReport }, {
            new: true,
            upsert: false,
            useFindAndModify: false
        }).exec();
        return orderReport;
    } catch (error) {
        throw error
    }
}