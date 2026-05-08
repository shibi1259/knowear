const db = require('../db')

exports.create = async (objInvoice) => {
    try {
        let invoice = new db.Invoice(objInvoice)
        await invoice.save()
        return invoice;
    } catch (error) {
        throw (error)
    }
}

exports.update = async (query, dataQuery) => {
    try {
        let response = await db.Invoice.findOneAndUpdate(query, { $set: dataQuery }, {
            new: true,
            upsert: false,
            useFindAndModify: false
        }).exec();
        return response;
    } catch (error) {
        throw (error)
    }
}