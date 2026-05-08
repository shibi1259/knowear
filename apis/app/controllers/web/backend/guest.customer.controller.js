const helper = require("../../../../util/responseHelper");
const { messages } = require("../../../../config/constants");
const service = require("../../../services/guest.customer.service");

exports.search = async (req, res) => {
    try {
        const { page, limit, keyword } = req?.query
        let query = {}
        keyword ? query['$or'] = [{
            name: { $regex: keyword, $options: 'i' }
        }, {
            email: { $regex: keyword, $options: 'i' }
        }, {
            mobile: { $regex: keyword, $options: 'i' }
        }] : null
        const response = await service.search(query, { __v: 0, _id: 0 }, { createdAt: -1 }, page, limit)
        helper.deliverResponse(res, 200, response, {
            error_code: messages.successResponse.error_code,
            error_message: messages.successResponse.error_message,
        })
    } catch (error) {
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.findOne = async (req, res) => {
    try {
        const { guest } = req.params
        const response = await service.findOne({ token: guest })
        helper.deliverResponse(res, 200, response, {
            error_code: messages.successResponse.error_code,
            error_message: messages.successResponse.error_message,
        })
    } catch (error) {
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}