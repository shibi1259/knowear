const { body, validationResult } = require("express-validator")
const service = require("../../../services/testimonial.service")
const helper = require('../../../../util/responseHelper')
const messages = require('../../../../config/constants').messages

exports.validate = (method) => {
    switch (method) {
        case 'create': {
            return [
                body('name', 'Name is required').exists(),
                body('message', 'Message is required').exists(),
                body('place', 'Place is required').exists(),
            ]
        }
        case 'update': {
            return [
                body('_id', 'Id is required').exists(),
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
        const response = await service.create(body)
        if (response instanceof Error) {
            helper.deliverResponse(res, 422, response, {
                "error_code": messages.serverError.error_code,
                "error_message": messages.serverError.error_message
            });
        } else {
            helper.deliverResponse(res, 200, response, {
                "error_code": messages.TESTIMONIAL_ADDED.error_code,
                "error_message": messages.TESTIMONIAL_ADDED.error_message
            });
        }
    } catch (error) {
        console.log("Error caught in create testimonial :: " + error)
        helper.deliverResponse(res, 422, error, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.searchTestimonials = async (req, res) => {
    try {
        const { body } = req
        let { page, limit } = req.query
        let query = { isDelete: false }
        body?.keyword ? query['$or'] = [
            { name: { $regex: body.keyword, $options: 'i' } },
            { profession: { $regex: body.keyword, $options: 'i' } },
            { business: { $regex: body.keyword, $options: 'i' } },
            { place: { $regex: body.keyword, $options: 'i' } }] : null
        body?.isActive ? query['isActive'] = body.isActive : null
        const response = await service.search(query, page, limit)
        helper.deliverResponse(res, 200, response, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        })
    } catch (error) {
        helper.deliverResponse(res, 422, error, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.getTestimonials = async (req, res) => {
    try {
        const { body } = req
        const response = await service.find({ isDelete: false, ...body })
        helper.deliverResponse(res, 200, response, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        })
    } catch (error) {
        helper.deliverResponse(res, 422, error, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.getTestimonialDetails = async (req, res) => {
    try {
        const { id } = req.query
        const response = await service.findOne({ _id: id })
        helper.deliverResponse(res, 200, response, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        })
    } catch (error) {
        helper.deliverResponse(res, 422, error, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.update = async (req, res, next) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            helper.deliverResponse(res, 422, errors, {
                "error_code": messages.VALIDATION_ERROR.error_code,
                "error_message": messages.VALIDATION_ERROR.error_code
            })
            return;
        }

        const { body } = req
        let response = await service.update({ _id: body._id }, body)
        if (response instanceof Error) {
            helper.deliverResponse(res, 422, response, {
                "error_code": messages.serverError.error_code,
                "error_message": messages.serverError.error_message
            });
        } else {
            helper.deliverResponse(res, 200, response, {
                "error_code": messages.TESTIMONIAL_UPDATED.error_code,
                "error_message": messages.TESTIMONIAL_UPDATED.error_message
            });
        }
    } catch (error) {
        helper.deliverResponse(res, 422, error, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}
