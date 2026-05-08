const { body, validationResult } = require("express-validator");
const helper = require("../../../../util/responseHelper");
const { messages } = require("../../../../config/constants");
const service = require("../../../services/analytics.sevice");

exports.validate = (method) => {
    switch (method) {
        case 'manage': {
            return [
                body('analyticsId', `Analytics ID is required`).exists(),
                body('tagId', `Tag manager ID is required`).exists(),
            ]
        }
    }
}

exports.manageAnalytics = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            helper.deliverResponse(res, 422, errors, {
                "error_code": messages.VALIDATION_ERROR.error_code,
                "error_message": messages.VALIDATION_ERROR.error_message
            })
            return;
        }

        let { body } = req;
        const analyticsDetails = await service.findOne({ refid: '1', isDelete: false })
        if (analyticsDetails) {
            let response = await service.update({ refid: analyticsDetails?.refid }, body)
            if (response) {
                helper.deliverResponse(res, 200, {}, {
                    "error_code": messages.UPDATE_ANALYTICS.error_code,
                    "error_message": messages.UPDATE_ANALYTICS.error_message
                });
            }
        } else {
            body.refid = await service.count({}) + 1
            let response = await service.create(body);
            if (response) {
                helper.deliverResponse(res, 200, {}, {
                    "error_code": messages.ADD_ANALYTICS.error_code,
                    "error_message": messages.ADD_ANALYTICS.error_message
                });
            }
        }
    } catch (error) {
        console.log('Error caught in manage analytics API :: ' + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.getAnalyticsDetails = async (req, res) => {
    try {
        const scriptDetails = await service.findOne({ refid: '1', isDelete: false }, { _id: 0, createdAt: 0, updatedtAt: 0, __v: 0 })
        helper.deliverResponse(res, 200, scriptDetails, {
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