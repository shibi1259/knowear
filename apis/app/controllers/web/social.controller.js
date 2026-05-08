const { body } = require('express-validator')
const helper = require('../../../util/responseHelper')
const messages = require('../../../config/constants').messages
const socialService = require('../../services/social.service')

exports.create = async (req, res) => {
    try {
        const { body } = req
        const socialDetails = await socialService.getSocialDetails({ refid: '1' })
        if (socialDetails) {
            await socialService.updateSocial({ refid: '1' }, body)
        } else {
            body.refid = await socialService.getSocialCount({}) + 1
            await socialService.createSocial(body)
        }
        helper.deliverResponse(res, 200, {}, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        });
    } catch (error) {
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.getSocialDetails = async (req, res) => {
    try {
        const social = await socialService.getSocialDetails({ refid: '1' })
        helper.deliverResponse(res, 200, social, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        })
    } catch (error) {
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}