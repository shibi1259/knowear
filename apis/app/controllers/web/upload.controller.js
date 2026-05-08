const { BASE_URL } = require('../../../config/constants/common');
const helper = require('../../../util/responseHelper')
const messages = require('../../../config/constants').messages
const fs = require("fs")
const { body, validationResult } = require("express-validator")

exports.validate = (method) => {
    switch (method) {
        case 'delete': {
            return [
                body("location", `Location is required`).exists(),
            ]
        }
    }
}

exports.create = (req, res) => {
    try {
        const { file } = req
        if (file) {
            helper.deliverResponse(res, 200, {
                path: file.path ? BASE_URL + file.path : null,
                location: file.path ? "/" + file.path : null,
            }, {
                "error_code": messages.FILES_UPLOADED.error_code,
                "error_message": messages.FILES_UPLOADED.error_message
            });
        }
    } catch (error) {
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.delete = (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            helper.deliverResponse(res, 422, errors, {
                "error_code": messages.VALIDATION_ERROR.error_code,
                "error_message": messages.VALIDATION_ERROR.error_message
            })
            return;
        }

        const { body } = req
        fs.access(process.cwd() + body.location, fs.constants.F_OK, (err) => {
            if (err) {
                helper.deliverResponse(res, 422, {}, {
                    "error_code": messages.fileNotFound.error_code,
                    "error_message": messages.fileNotFound.error_message
                });
            } else {
                fs.unlink(process.cwd() + body.location, (error) => {
                    if (error) {
                        helper.deliverResponse(res, 422, {}, {
                            "error_code": messages.FILE_ERROR.error_code,
                            "error_message": messages.FILE_ERROR.error_message
                        });
                    } else {
                        helper.deliverResponse(res, 200, {}, {
                            "error_code": messages.FILE_DELETED.error_code,
                            "error_message": messages.FILE_DELETED.error_message
                        });
                    }
                });
            }
        });
    } catch (error) {
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}