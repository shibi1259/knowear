
const helper = require('../../../../util/responseHelper')
const service = require('../../../services/invoice.service')
const messages = require('../../../../config/constants').messages
const db = require('../../../db')

exports.create = async (req, res) => {
    try {
        const { body } = req
        let response = await service.create(body)

        if (response instanceof Error) {
            return helper.deliverResponse(res, 200, {}, messages.serverError)
        }

        helper.deliverResponse(res, 200, response, messages.successResponse)
    } catch (error) {
        console.log(`Error caught in create invoice ${error}`);
        helper.deliverResponse(res, 422, error, messages.serverError);
    }
}

exports.findOne = async (req, res) => {
    try {
        const invoiceItems = await db.Invoice.find({})
        helper.deliverResponse(res, 200, invoiceItems.pop(), messages.successResponse)
    } catch (error) {
        helper.deliverResponse(res, 200, {}, messages.serverError);
    }
}

exports.update = async (req, res, next) => {
    try {
        const { body } = req
        const invoiceItems = await db.Invoice.find({})
        const invoiceDetails = invoiceItems.pop()
        const response = await service.update({ _id: invoiceDetails._id }, body)
        if (response instanceof Error) {
            return helper.deliverResponse(res, 200, {}, messages.serverError)
        }

        helper.deliverResponse(res, 200, response, messages.successResponse)
    } catch (error) {
        console.log(`Error caught in update invoice ${error}`);
        helper.deliverResponse(res, 422, error, messages.serverError);
    }
}
