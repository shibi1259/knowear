const db = require("../db")

exports.createProductReport = async (objproductReport) => {
    try {
        let productReport = new db.ProductReport(objproductReport)
        await productReport.save();
        return productReport;
    } catch (error) {
        throw error;
    }
}

exports.getAllProductReport = async () => {
    try {
        let productReport = await db.ProductReport.find({ isDelete: false })
            .populate({ path: 'orderId', select: 'orderDate orderNo orderStatus paymentMethod total', model: 'orders' })
            .populate({ path: 'productId', select: 'name mrpPrice offerPrice', model: 'products' })
            .populate({ path: 'customerId', select: 'firstname lastname email mobile', model: 'customers' })
            .exec()
        return productReport;
    } catch (error) {
        throw (error)
    }
}

exports.getActiveProductReport = async (obj, projection = {}) => {
    try {
        let productReport = await db.ProductReport.find(obj, projection)
            .populate({ path: 'orders', model: 'orders', populate: { path: 'customerId', model: 'customers' } })
            .populate({ path: 'orders', model: 'orders', populate: { path: 'product.productId', model: 'products' } })
            .exec()
        return productReport;
    } catch (error) {
        throw (error)
    }
}

exports.updateProductReport = async (id, objproductReport) => {
    try {
        let productReport = await db.ProductReport.findOneAndUpdate({ _id: id }, { $set: objproductReport }, {
            new: true,
            upsert: false,
            useFindAndModify: false
        }).exec()
        return productReport;
    } catch (error) {
        throw error;
    }
}