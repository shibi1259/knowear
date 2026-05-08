const { body, validationResult } = require("express-validator")
const service = require("../../services/about.service")
const helper = require('../../../util/responseHelper')
const messages = require('../../../config/constants').messages
const activity = require("../../../util/activity.creator")


exports.getAboutDetails = async (req, res) => {
    try {
        // Add cache control headers for static about content
        res.set('Cache-Control', 'public, max-age=3600'); // 1 hour cache
        
        const response = await service.getAboutDetails({ refid: 'about-us' })
        helper.deliverResponse(res, 200, response, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        })
    } catch (error) {
        // Remove debug console.log for production
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}
