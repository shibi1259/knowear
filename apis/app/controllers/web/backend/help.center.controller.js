const { body, validationResult } = require("express-validator")
const service = require("../../../services/help.center.service")
const helper = require('../../../../util/responseHelper')
const messages = require('../../../../config/constants').messages
const crypto = require('crypto');
const settingsService = require("../../../services/general.settings.service")
const templates = require("../../../../util/templates")
const mailer = require("../../../../util/sendMail")

exports.validate = (method) => {
    switch (method) {
        case 'manage': {
            return [
                body('email', 'Email is required').exists(),
                body('countryCode', 'Country code is required').exists(),
                body('phone', 'Phone number is required').exists(),
                body('description', 'Description is required').exists()
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
        const details = await service.findOne()
        if (details) {
            const response = await service.update({ refid: '1' }, body)
            if (response instanceof Error) {
                helper.deliverResponse(res, 422, {}, {
                    "error_code": messages.serverError.error_code,
                    "error_message": messages.serverError.error_message
                });
            } else {
                helper.deliverResponse(res, 200, response, {
                    "error_code": messages.successResponse.error_code,
                    "error_message": messages.successResponse.error_message
                });
            }
        } else {
            body.refid = '1'
            const response = await service.create(body)
            if (response instanceof Error) {
                helper.deliverResponse(res, 422, {}, {
                    "error_code": messages.serverError.error_code,
                    "error_message": messages.serverError.error_message
                });
            } else {
                helper.deliverResponse(res, 200, response, {
                    "error_code": messages.successResponse.error_code,
                    "error_message": messages.successResponse.error_message
                });
            }
        }
    } catch (error) {
        console.log('Error caught in manage help center API :: ' + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.getDetails = async (req, res) => {
    try {
        const details = await service.findOne()
        helper.deliverResponse(res, 200, details, {
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

exports.shareVerification = async (req, res) => {
    try {
        const details = await service.findOne()
        const token = crypto.randomBytes(20).toString('hex');
        const settings = await settingsService.findOne({ })
        setTimeout(async () => {
            await service.update({ refid: '1' }, { verification: { email: '', phone: details?.verification?.phone } });
        }, 120000);
        const domain = settings?.domain?.endsWith('/') ? settings?.domain : settings?.domain + '/'
        const url = domain + '/admin/support-email/' + token
        await service.update({ refid: '1' }, { verification: { email: token, phone: details?.verification?.phone } });
        const subject = 'Verify your email address'
        const content = 'Kindly click on the below link to verify your email address'
        const html = await templates.supportEmailVerification({ url: url }, settings)
        await mailer.sendMail(details?.email, subject, content, html)
        helper.deliverResponse(res, 200, {}, {
            "error_code": messages.EMAIL_SENT.error_code,
            "error_message": messages.EMAIL_SENT.error_message
        });
    } catch (error) {
        console.log('Error caught in share verification link API :: ' + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.verifySupportEmail = async (req, res) => {
    try {
        const { body } = req
        const details = await service.findOne()
        if (details?.verification?.email) {
            if (body?.token == details?.verification?.email) {
                const response = await service.update({ refid: '1' }, {
                    verification: { email: '', phone: details?.verification?.phone },
                    isEmailVerified: true
                })

                if (response instanceof Error) {
                    helper.deliverResponse(res, 200, {}, {
                        "error_code": messages.serverError.error_code,
                        "error_message": messages.serverError.error_message
                    });
                } else {
                    helper.deliverResponse(res, 200, {}, {
                        "error_code": messages.EMAIL_VERIFIED.error_code,
                        "error_message": messages.EMAIL_VERIFIED.error_message
                    });
                }
            } else {
                helper.deliverResponse(res, 200, {}, {
                    "error_code": messages.INVALID_VERIFICATION_TOKEN.error_code,
                    "error_message": messages.INVALID_VERIFICATION_TOKEN.error_message
                });
            }
        } else {
            helper.deliverResponse(res, 200, {}, {
                "error_code": messages.VERIFICATION_TOKEN_EXPIRED.error_code,
                "error_message": messages.VERIFICATION_TOKEN_EXPIRED.error_message
            });
        }

    } catch (error) {
        console.log('Error caught in verify link API :: ' + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}