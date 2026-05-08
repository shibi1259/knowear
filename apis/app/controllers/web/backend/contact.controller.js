const helper = require("../../../../util/responseHelper");
const { messages } = require("../../../../config/constants");
const service = require("../../../services/contact.service");

exports.create = async (req, res) => {
    try {
        const { body } = req;
        const contactDetails = await service.findOne({})
        if (contactDetails) {
            const response = await service.update({ _id: contactDetails._id }, body);
            if (response instanceof Error) {
                helper.deliverResponse(res, 422, {}, {
                    "error_code": messages.successResponse.error_code,
                    "error_message": messages.successResponse.error_message
                });
            } else {
                helper.deliverResponse(res, 200, response, {
                    "error_code": messages.CONTACT_CMS_UPDATED.error_code,
                    "error_message": messages.CONTACT_CMS_UPDATED.error_message
                });
            }
        } else {
            const response = await service.create(body);
            if (response instanceof Error) {
                helper.deliverResponse(res, 422, {}, {
                    "error_code": messages.successResponse.error_code,
                    "error_message": messages.successResponse.error_message
                });
            } else {
                helper.deliverResponse(res, 200, response, {
                    "error_code": messages.CONTACT_CMS_UPDATED.error_code,
                    "error_message": messages.CONTACT_CMS_UPDATED.error_message
                });
            }
        }
    } catch (error) {
        console.log("Error caught in create contact api :: " + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.findOne = async (req, res) => {
    try {
        const response = await service.findOne({}, {});
        helper.deliverResponse(res, 200, response, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        });
    } catch (error) {
        console.log("Error caught in get contact details api :: " + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}