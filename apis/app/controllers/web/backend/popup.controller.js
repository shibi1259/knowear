const { body, validationResult } = require("express-validator");
const helper = require("../../../../util/responseHelper");
const { messages } = require("../../../../config/constants");
const service = require("../../../services/popup.service");
const activity = require("../../../../util/activity.creator")
const media = require("../../../../util/media.uploader")

exports.managePopup = async (req, res) => {
    try {
        let { body } = req
        const { email } = res?.locals?.user
        const popupDetails = await service.findOne({ refid: '1' })
        if (popupDetails) {
            let response = await service.update({ refid: '1' }, body)
            if (response instanceof Error) {
                helper.deliverResponse(res, 422, response, {
                    "error_code": messages.serverError.error_code,
                    "error_message": messages.serverError.error_message
                });
            } else {
                activity.logActivity(email, 'Store poup updated')
                helper.deliverResponse(res, 200, {}, {
                    "error_code": messages.POPUP_UPDATED.error_code,
                    "error_message": messages.POPUP_UPDATED.error_message
                });
            }
        } else {
            let response = await service.create(body)
            if (response instanceof Error) {
                helper.deliverResponse(res, 422, {}, {
                    "error_code": messages.serverError.error_code,
                    "error_message": messages.serverError.error_message
                });
            } else {
                activity.logActivity(email, 'Store poup addded')
                helper.deliverResponse(res, 200, {}, {
                    "error_code": messages.POPUP_UPDATED.error_code,
                    "error_message": messages.POPUP_UPDATED.error_message
                });
            }
        }
    } catch (error) {
        console.log('Error caught in manage popup API :: ' + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.removePopup = async (req, res) => {
    try {
        const { type } = req.params
        let data = { isVisible: false }
        type == 'mobile' ? data['mobile'] = null : type == 'website' ? data['website'] = null : type == 'app' ? data['app'] = null : null
        const popupDetails = await service.update({ refid: '1' }, data)
        if (popupDetails instanceof Error) {
            helper.deliverResponse(res, 422, popupDetails, {
                "error_code": messages.serverError.error_code,
                "error_message": messages.serverError.error_message
            });
        } else {
            helper.deliverResponse(res, 200, {}, {
                "error_code": messages.POPUP_UPDATED.error_code,
                "error_message": messages.POPUP_UPDATED.error_message
            });
        }
    } catch (error) {
        console.log('Error caught in popup details API :: ' + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.popupDetails = async (req, res) => {
    try {
        const popupDetails = await service.findOne({ refid: '1' })
        helper.deliverResponse(res, 200, popupDetails, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        });
    } catch (error) {
        console.log('Error caught in popup details API :: ' + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}