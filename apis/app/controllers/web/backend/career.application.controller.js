const { create, findOne, update, search } = require("../../../services/career.application.service")
const { deliverResponse } = require('../../../../util/responseHelper')
const { messages } = require("../../../../config/constants")

exports.create = async (req, res) => {
    const response = await create({
        ...req.body, resume: req.file.location
    })
    if (response instanceof Error) {
        deliverResponse(res, 422, response, {
            error_code: messages.serverError.error_code,
            error_message: messages.serverError.error_message
        })
    } else {
        deliverResponse(res, 201, response, {
            error_code: messages.APPLICATION_SUBMITTED.error_code,
            error_message: messages.APPLICATION_SUBMITTED.error_message
        })
    }
}

exports.search = async (req, res) => {
    const { page, limit, keyword } = req.query
    let query = {}
    if (keyword) {
        query['$or'] = [
            { firstname: { $regex: keyword, $options: 'i' } },
            { lastname: { $regex: keyword, $options: 'i' } },
            { email: { $regex: keyword, $options: 'i' } },
            { phone: { $regex: keyword, $options: 'i' } },
            { designation: { $regex: keyword, $options: 'i' } }
        ]
    }
    const response = await search(query, page, limit)
    deliverResponse(res, 200, response, {
        error_code: messages.successResponse.error_code,
        error_message: messages.successResponse.error_message
    })
}

exports.findOne = async (req, res) => {
    console.log(req.params.applicationId);
    const response = await findOne({ _id: req.params.applicationId })
    deliverResponse(res, 200, response, {
        error_code: messages.successResponse.error_code,
        error_message: messages.successResponse.error_message
    })
}

exports.update = async (req, res) => {
    const response = await update({ _id: req.params.applicationId }, req.body)
    if (response instanceof Error) {
        deliverResponse(res, 422, response, {
            error_code: messages.serverError.error_code,
            error_message: messages.serverError.error_message
        })
    } else {
        deliverResponse(res, 200, response, {
            error_code: messages.successResponse.error_code,
            error_message: messages.successResponse.error_message
        })
    }
}