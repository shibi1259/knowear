const db = require("../db")

exports.createCustomerReport = async (objCustomerReport) => {
    try {
        let customerReport = new db.CustomerReport(objCustomerReport)
        await customerReport.save()
        return customerReport;
    } catch (error) {
        throw error
    }
}

exports.getAllCustomerReport = async () => {
    try {
        let customerReport = await db.CustomerReport.find({ isDelete: false })
            .populate({ path: 'orderId', select: '_id orderDate orderStatus', model: 'orders' })
            .populate({ path: 'customerId', select: '_id firstname lastname mobile email address', model: 'customers' })
        return customerReport;
    } catch (error) {
        throw (error)
    }
}

exports.getActiveCustomerReport = async (obj, projection = {}) => {
    try {
        let customerReport = await db.CustomerReport.find(obj, projection)
        return customerReport;
    } catch (error) {
        throw error
    }
}

exports.updateCustomerReport = async (id, objCustomerReport) => {
    try {
        let customerReport = await db.CustomerReport.findOneAndUpdate({ _id: id }, { $set: objCustomerReport }, {
            new: true,
            upsert: false,
            useFindAndModify: false
        }).exec();
        return customerReport;
    } catch (error) {
        throw error
    }
}