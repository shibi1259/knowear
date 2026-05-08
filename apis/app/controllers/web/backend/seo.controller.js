const { body, validationResult } = require("express-validator");
const helper = require("../../../../util/responseHelper");
const { messages } = require("../../../../config/constants");
const service = require("../../../services/seo.service");

exports.validate = (method) => {
    switch (method) {
        case 'create': {
            return [
                body('url', `url is required`).exists(),
                body('title', `title is required`).exists(),
                body('keywords', `keywords is required`).exists(),
                body('description', `url is required`).exists(),
                body('page', `page is required`).exists(),
            ]
        }
        case 'update': {
            return [
                body('url', `url is required`).exists(),
                body('title', `title is required`).exists(),
                body('keywords', `keywords is required`).exists(),
                body('description', `url is required`).exists(),
                body('page', `page is required`).exists(),
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

        const { body } = req;
        let response = {}
        const seoDetails = await service.findOne({ page: body.page, isDelete: false })
        if (seoDetails) {
            if (body.type == 'create') {
                helper.deliverResponse(res, 422, {}, {
                    "error_code": messages.DUPLICATE_SEO.error_code,
                    "error_message": messages.DUPLICATE_SEO.error_message
                })
                return;
            } else {
                response = await service.update({ _id: seoDetails._id }, body);
                helper.deliverResponse(res, 200, response, {
                    "error_code": messages.SEO_UPDATED.error_code,
                    "error_message": messages.SEO_UPDATED.error_message
                })
                return;
            }
        } else {
            if (body.type == 'create') {
                response = await service.create(body);
                helper.deliverResponse(res, 200, {}, {
                    "error_code": messages.SEO_ADDED.error_code,
                    "error_message": messages.SEO_ADDED.error_message
                })
                return;
            } else {
                helper.deliverResponse(res, 422, {}, {
                    "error_code": messages.UNABLE_TO_ADD_SEO.error_code,
                    "error_message": messages.UNABLE_TO_ADD_SEO.error_message
                })
                return;
            }
        }
    } catch (error) {
        console.log('Error caught while creating SEO :: ' + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.findSeo = async (req, res) => {
    try {
        const response = await service.find({ isActive: true, isDelete: false })
        helper.deliverResponse(res, 200, response, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        });
    } catch (error) {
        console.log(error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.findSeoDetails = async (req, res) => {
    try {
        const { seo } = req?.params
        const response = await service.findOne({ _id: seo, isActive: true, isDelete: false })
        helper.deliverResponse(res, 200, response, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        });
    } catch (error) {
        console.log(error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}
