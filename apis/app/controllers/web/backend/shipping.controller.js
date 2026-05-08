const { body, validationResult } = require("express-validator");
const helper = require("../../../../util/responseHelper");
const { messages } = require("../../../../config/constants");
const service = require("../../../services/shipping.service");

exports.validate = (method) => {
    switch (method) {
        case 'manage': {
            return [
                body('cost', `Cost is required`).exists(),
            ]
        }
    }
}

exports.manage = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            helper.deliverResponse(res, 422, errors, {
                "error_code": messages.VALIDATION_ERROR.error_code,
                "error_message": messages.VALIDATION_ERROR.error_message
            })
            return;
        }

        const { body } = req;
        const details = await service.findOne({ refid: '1' })
        if (details) {
            const response = await service.update({ refid: '1' }, body);
            if (response instanceof Error) {
                helper.deliverResponse(res, 422, {}, {
                    "error_code": messages.serverError.error_code,
                    "error_message": messages.serverError.error_message
                });
            } else {
                helper.deliverResponse(res, 200, response, {
                    "error_code": messages.SHIPPING_UPDATED.error_code,
                    "error_message": messages.SHIPPING_UPDATED.error_message
                });
            }
        } else {
            const response = await service.create(body);
            if (response instanceof Error) {
                helper.deliverResponse(res, 422, {}, {
                    "error_code": messages.serverError.error_code,
                    "error_message": messages.serverError.error_message
                });
            } else {
                helper.deliverResponse(res, 200, response, {
                    "error_code": messages.SHIPPING_UPDATED.error_code,
                    "error_message": messages.SHIPPING_UPDATED.error_message
                });
            }
        }

    } catch (error) {
        console.log('Error caught in manage shipping details API :: ' + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.details = async (req, res) => {
    try {
        const details = await service.findOne({ refid: '1' })
        helper.deliverResponse(res, 200, details, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        });
    } catch (error) {
        console.log('Error caught in get shipping details API :: ' + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}