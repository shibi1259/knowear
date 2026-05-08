const { body, validationResult } = require("express-validator")
const service = require("../../services/about.service")
const helper = require('../../../util/responseHelper')
const messages = require('../../../config/constants').messages
const activity = require("../../../util/activity.creator")


exports.getAboutDetails = async (req, res) => {
    try {
        const response = await service.getAboutDetails({ refid: 'about-us' })
        console.log(response,"response")
        helper.deliverResponse(res, 200, response, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        })
    } catch (error) {
        console.log("Error caught in get about details API :: " + error);
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}
