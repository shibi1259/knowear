const helper = require('../../../../util/responseHelper')
const { body, validationResult } = require('express-validator')
const messages = require('../../../../config/constants').messages
const service = require('../../../services/banner.image.service')
const adminService = require("../../../services/auth.service")
const activity = require("../../../../util/activity.creator")
const { months } = require('../../../../util/months')

const getAdminDetails = async (email) => {
    const details = await adminService.adminDetails({ email: email, isActive: true, isDelete: false })
    return details
}

exports.validate = (method) => {
    switch (method) {
        case 'create': {
            return [
                body('type', `Type is required`).exists(),
                body('media', `Media is required`).exists(),
            ]
        }
        case 'update': {
            return [
                body('type', `Type is required`).exists(),
                body('media', `Media is required`).exists(),
                body('refid', `Refernce is required`).exists(),
            ]
        }
    }
}

exports.create = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            helper.deliverResponse(res, 422, errors, {
                "error_code": messages.VALIDATION_ERROR.error_code,
                "error_message": messages.VALIDATION_ERROR.error_message
            })
            return;
        }

        const adminEmail = res?.locals?.user?.email
        const admin = await getAdminDetails(adminEmail)
        let { body } = req;
        body.createdBy = admin?._id
        const details = await service.findOne({ type: body.type, isDelete: false })
        if (details) {
            helper.deliverResponse(res, 200, { refid: details.refid }, {
                "error_code": messages.BANNER_IMAGE_EXISTS.error_code,
                "error_message": messages.BANNER_IMAGE_EXISTS.error_message
            });
        } else {
            body.refid = await service.count({}) + 1
            let response = await service.create(body)
            if (response instanceof Error) {
                helper.deliverResponse(res, 422, response, {
                    "error_code": messages.serverError.error_code,
                    "error_message": messages.serverError.error_message
                });
            } else {
                activity.logActivity(adminEmail, `${body.type} banner image created`)
                helper.deliverResponse(res, 200, response, {
                    "error_code": messages.BANNER_IMAGE_ADDED.error_code,
                    "error_message": messages.BANNER_IMAGE_ADDED.error_message
                });
            }
        }
    } catch (error) {
        console.log('Error caught in create banner images API :: ' + error);
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.search = async (req, res) => {
    try {
        let response = await service.find({ isDelete: false }, {})
        let result = []
        for(let item of response){
            result.push({
                ...item._doc,
                createdAt: months[item.createdAt.getMonth()] + ' ' + item.createdAt.getDate()+ ' ' + item.createdAt.getFullYear() + ', ' + item.createdAt.toLocaleTimeString()
            })
        }
        if (response instanceof Error) {
            helper.deliverResponse(res, 422, response, {
                "error_code": messages.serverError.error_code,
                "error_message": messages.serverError.error_message
            });
        } else {
            helper.deliverResponse(res, 200, result, {
                "error_code": messages.successResponse.error_code,
                "error_message": messages.successResponse.error_message
            });
        }
    } catch (error) {
        console.log('Error caught in get banner images API :: ' + error);
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.update = async (req, res) => {
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
        const response = await service.update({ refid: body.refid }, body)
        if (response instanceof Error) {
            helper.deliverResponse(res, 422, response, {
                "error_code": messages.serverError.error_code,
                "error_message": messages.serverError.error_message
            });
        } else {
            helper.deliverResponse(res, 200, response, {
                "error_code": messages.BANNER_IMAGE_UPDATED.error_code,
                "error_message": messages.BANNER_IMAGE_UPDATED.error_message
            });
        }
    } catch (error) {
        console.log('Error caught in update banner image API :: ' + error);
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.delete = async (req, res) => {
    try {
        const { bannerimage } = req.params
        const response = await service.update({ refid: bannerimage }, { isDelete: true })
        if (response instanceof Error) {
            helper.deliverResponse(res, 422, response, {
                "error_code": messages.serverError.error_code,
                "error_message": messages.serverError.error_message
            });
        } else {
            helper.deliverResponse(res, 200, response, {
                "error_code": messages.BANNER_IMAGE_DELETED.error_code,
                "error_message": messages.BANNER_IMAGE_DELETED.error_message
            });
        }
    } catch (error) {
        console.log('Error caught in delete banner image API :: ' + error);
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}