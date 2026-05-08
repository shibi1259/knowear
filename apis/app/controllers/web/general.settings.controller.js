const { BASE_URL } = require('../../../config/constants/common')
const helper = require('../../../util/responseHelper')
const messages = require('../../../config/constants').messages
const service = require('../../services/general.settings.service')

exports.getSettings = async (req, res) => {
    try {
        const response = await service.findOne({})
        helper.deliverResponse(res, 200, {
            ...response?._doc,
            logo: {
                light: `${BASE_URL}${response?.logo?.light}`,
                dark: `${BASE_URL}${response?.logo?.dark}`
            },
        }, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        });
    } catch {
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}