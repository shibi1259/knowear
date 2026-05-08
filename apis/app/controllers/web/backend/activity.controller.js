const { body, validationResult } = require("express-validator")
const service = require("../../../services/activity.service")
const helper = require('../../../../util/responseHelper')
const messages = require('../../../../config/constants').messages

exports.getActivities = async (req, res) => {
    try {
        const { body } = req
        let data = {}
        if (body.admin) data['admin'] = body.admin
        if (body.date) data['$and'] = [
            { createdAt: { $gte: new Date(new Date(body.date).setHours(0, 0, 0, 0)).toISOString() } },
            { createdAt: { $lte: new Date(new Date(body.date).setHours(23, 59, 59, 59)).toISOString() } }
        ]
        const activities = await service.search(data, {}, body.page, body.limit)
        helper.deliverResponse(res, 200, activities, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        });
    } catch (error) {
        console.log('Error caught in get activities API :: ' + error);
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}