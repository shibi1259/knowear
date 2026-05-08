const helper = require('../../../../util/responseHelper')
const { body, validationResult } = require('express-validator')
const messages = require('../../../../config/constants').messages
const service = require('../../../services/tax-class.service')
const slug = require('../../../../util/slug')
const db = require('../../../db')
const productService = require("../../../services/product.head.service")
const adminService = require("../../../services/auth.service")

const getAdminDetails = async (email) => {
    const details = await adminService.adminDetails({ email: email, isActive: true, isDelete: false })
    return details
}

exports.validate = (method) => {
    switch (method) {
        case 'add': {
            return [
                body('name', `Name is required`).exists(),
                body('rules', `Rules is required`).exists(),
            ]
        }
        case 'update': {
            return [
                body('name', `Name is required`).exists(),
                body('rules', `Rules is required`).exists(),
                body('slug', `Slug is required`).exists(),
            ]
        }
        case 'search': {
            return [
                body('page', `Page is required`).exists(),
                body('limit', `Limit is required`).exists(),
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

        let { body } = req;
        const { email } = res?.locals?.user
        const admin = await getAdminDetails(email)
        body.createdBy = admin?._id
        body.slug = await slug.createSlug(db.TaxClass, body.name, { slug: await slug.generateSlug(body.name) });
        let rate = 0
        for (let rule of body.rules) rate += rule?.rate
        body.rate = rate
        let response = await service.create(body);
        if (response instanceof Error) {
            helper.deliverResponse(res, 422, {}, {
                "error_code": messages.serverError.error_code,
                "error_message": messages.serverError.error_message
            });
        } else {
            helper.deliverResponse(res, 200, response, {
                "error_code": messages.ADD_TAXCLASS.error_code,
                "error_message": messages.ADD_TAXCLASS.error_message
            });
        }
    } catch (error) {
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.getClass = async (req, res, next) => {
    try {
        let response = await service.find({ isDelete: false })
        helper.deliverResponse(res, 200, response, {
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

exports.getActiveClass = async (req, res, next) => {
    try {
        let response = await service.find({ isDelete: false, isActive: true })
        helper.deliverResponse(res, 200, response, {
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

exports.getClassDetails = async (req, res, next) => {
    try {
        const { tax } = req.params;
        let response = await service.findOne({ slug: tax })
        helper.deliverResponse(res, 200, response, {
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

exports.search = async (req, res) => {
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
        let data = { isDelete: false }
        if (body?.keyword) data['name'] = { $regex: body.keyword, $options: 'i' }
        const response = await service.search(data, body.page, body.limit, { __v: 0, createdAt: 0, updatedAt: 0, _id: 0 })
        helper.deliverResponse(res, 200, response, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        });
    } catch (error) {
        console.log('Error caught in search tax class API :: ' + error);
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.update = async (req, res, next) => {
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
        const classDetails = await service.findOne({ slug: body?.slug, isDelete: false })
        if (classDetails.name != body?.name) body.slug = await slug.createSlug(db.TaxClass, body.name, { slug: await slug.generateSlug(body.name) })
        let productDetails = await productService.find({ tax: classDetails?._id, isDelete: false })
        if (productDetails.length > 0 && (body?.isActive == 'false' || body?.isActive == false)) {
            helper.deliverResponse(res, 422, {}, {
                "error_code": messages.ERROR_TAXCLASS.error_code,
                "error_message": messages.ERROR_TAXCLASS.error_message
            });
        } else {
            let response = await service.update({ _id: classDetails?._id }, body)
            if (response instanceof Error) {
                helper.deliverResponse(res, 422, {}, {
                    "error_code": messages.serverError.error_code,
                    "error_message": messages.serverError.error_message
                });
            } else {
                helper.deliverResponse(res, 200, response, {
                    "error_code": messages.UPDATE_TAXCLASS.error_code,
                    "error_message": messages.UPDATE_TAXCLASS.error_message
                });
            }
        }
    } catch (error) {
        console.log('Error caught in update tax class API :: ' + error);
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.delete = async (req, res) => {
    try {
        const { tax } = req.params
        const classDetails = await service.findOne({ slug: tax })
        let productDetails = await productService.find({ tax: classDetails?._id, isDelete: false })
        if (productDetails.length > 0) {
            helper.deliverResponse(res, 200, {}, {
                "error_code": messages.CLASS_DELETE_FAILED.error_code,
                "error_message": messages.CLASS_DELETE_FAILED.error_message
            });
        } else {
            const response = await service.update({ _id: classDetails._id }, { isDelete: true })
            if (response instanceof Error) {
                helper.deliverResponse(res, 200, response, {
                    "error_code": messages.serverError.error_code,
                    "error_message": messages.serverError.error_message
                });
            } else {
                helper.deliverResponse(res, 200, response, {
                    "error_code": messages.CLASS_DELETED.error_code,
                    "error_message": messages.CLASS_DELETED.error_message
                });
            }
        }
    } catch (error) {
        console.log('Error caught while delete tax class API :: ' + error);
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}