const helper = require('../../../../util/responseHelper')
const messages = require('../../../../config/constants').messages
const service = require('../../../services/enquiry.service')

exports.update = async (req, res) => {
    try {
        const response = await service.update({ _id: req.body?._id }, req.body)
        if (response instanceof Error) {
            helper.deliverResponse(res, 422, {}, {
                error_code: messages.serverError.error_code,
                error_message: messages.serverError.error_message,
            });
        } else {
            helper.deliverResponse(res, 200, response, {
                error_code: messages.successResponse.error_code,
                error_message: messages.successResponse.error_message,
            });
        }
    } catch (error) {
        console.log("Error caught in update enquiry :: " + error);
        helper.deliverResponse(res, 422, {}, {
            error_code: messages.serverError.error_code,
            error_message: messages.serverError.error_message,
        });
    }
}

exports.search = async (req, res) => {
    try {
        const { body } = req
        let query = {}
        if (body?.keyword) {
            query['$or'] = [
                { name: { $regex: body?.keyword, $options: 'i' } },
                { email: { $regex: body?.keyword, $options: 'i' } },
                { phone: { $regex: body?.keyword, $options: 'i' } },
            ]
        }
        const response = await service.search(query, body?.page, body?.limit)
        helper.deliverResponse(res, 200, response, {
            error_code: messages.successResponse.error_code,
            error_message: messages.successResponse.error_message,
        });
    } catch (error) {
        console.log("Error caught in search enquiry :: " + error);
        helper.deliverResponse(res, 422, {}, {
            error_code: messages.serverError.error_code,
            error_message: messages.serverError.error_message,
        });
    }
}

exports.findOne = async (req, res) => {
    try {
        const response = await service.findOne({ _id: req.params.enquiryId }, {})
        helper.deliverResponse(res, 200, response, {
            error_code: messages.successResponse.error_code,
            error_message: messages.successResponse.error_message,
        });
    } catch (_error) {
        helper.deliverResponse(res, 422, {}, {
            error_code: messages.serverError.error_code,
            error_message: messages.serverError.error_message,
        });
    }
}