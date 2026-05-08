const { body, validationResult } = require("express-validator");
const helper = require("../../../../util/responseHelper");
const { messages } = require("../../../../config/constants");
const service = require("../../../services/script.service");

exports.validate = (method) => {
    switch (method) {
        case 'manage': {
            return [
                body('script', `url is required`).exists(),
            ]
        }
    }
}

exports.manageScript = async (req, res) => {
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
        const scriptDetails = await service.findOne({ refid: '1', isDelete: false })
        if (scriptDetails) {
            let response = await service.update({ refid: scriptDetails?.refid }, body)
            if (response) {
                helper.deliverResponse(res, 200, {}, {
                    "error_code": messages.UPDATE_SCRIPT.error_code,
                    "error_message": messages.UPDATE_SCRIPT.error_message
                });
            }
        } else {
            body.refid = await service.count({}) + 1
            let response = await service.create(body);
            if (response) {
                helper.deliverResponse(res, 200, {}, {
                    "error_code": messages.ADD_SCRIPT.error_code,
                    "error_message": messages.ADD_SCRIPT.error_message
                });
            }
        }
    } catch (error) {
        console.log('Error caught in manage script API :: ' + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.getScriptDetails = async (req, res) => {
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