const service = require("../../../services/content.service")
const helper = require('../../../../util/responseHelper')
const messages = require('../../../../config/constants').messages

exports.manageContent = async (req, res) => {
    try {
        let { body } = req
        const contentDetails = await service.findOne({})
        if (contentDetails) {
            const content = await service.update({ _id: contentDetails?._id }, body)
            if (content instanceof Error) {
                helper.deliverResponse(res, 422, content, {
                    "error_code": messages.serverError.error_code,
                    "error_message": messages.serverError.error_message
                });
            } else {
                helper.deliverResponse(res, 200, content, {
                    "error_code": messages.UPDATE_CONTENT.error_code,
                    "error_message": messages.UPDATE_CONTENT.error_message
                });
            }
        } else {
            const content = await service.create(body)
            if (content instanceof Error) {
                helper.deliverResponse(res, 422, content, {
                    "error_code": messages.serverError.error_code,
                    "error_message": messages.serverError.error_message
                });
            } else {
                helper.deliverResponse(res, 200, content, {
                    "error_code": messages.ADD_CONTENT.error_code,
                    "error_message": messages.ADD_CONTENT.error_message
                });
            }
        }
    } catch (error) {
        console.log('Error caught in create content API :: ' + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.getContents = async (req, res) => {
    try {
        const contentDetails = await service.findOne({ })
        helper.deliverResponse(res, 200, contentDetails, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        })
    } catch (error) {
        console.log('Error caught in get content API :: ' + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}