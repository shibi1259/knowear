const { body, validationResult } = require("express-validator")
const service = require("../../../services/more.offers.service")
const helper = require('../../../../util/responseHelper')
const messages = require('../../../../config/constants').messages
const slug = require("../../../../util/slug");
const db = require("../../../db");
const activity = require("../../../../util/activity.creator")
const adminService = require("../../../services/auth.service")

const getAdminDetails = async (email) => {
    const details = await adminService.adminDetails({ email: email, isActive: true, isDelete: false })
    return details
}

exports.validate = (method) => {
    switch (method) {
        case 'create': {
            return [
                body('title', 'Title is required').exists(),
                body('startDate', 'Start date is required').exists(),
                body('endDate', 'End date is required').exists(),
                body('type', 'Percentage is required').exists(),
                body('value', 'Offer value is required').exists(),
            ]
        }
        case 'update': {
            return [
                body('title', 'Title is required').exists(),
                body('slug', 'Slug is required').exists(),
                body('startDate', 'Start date is required').exists(),
                body('endDate', 'End date is required').exists(),
                body('type', 'Percentage is required').exists(),
                body('value', 'Offer value is required').exists(),
            ]
        }
    }
}

exports.add = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            helper.deliverResponse(res, 422, errors, {
                "error_code": messages.VALIDATION_ERROR.error_code,
                "error_message": messages.VALIDATION_ERROR.error_message
            })
            return;
        }

        let { body } = req
        const { email } = res?.locals?.user
        const adminDetails = await getAdminDetails(email)
        body.createdBy = adminDetails?._id
        body.slug = await slug.createSlug(db.MoreOffers, body.title, { slug: await slug.generateSlug(body.title) });
        const response = await service.create(body)
        if (response instanceof Error) {
            helper.deliverResponse(res, 422, response, {
                "error_code": messages.serverError.error_code,
                "error_message": messages.serverError.error_message
            })
        } else {
            activity.logActivity(res?.locals?.user?.email, `New more offer created`)
            helper.deliverResponse(res, 200, response, {
                "error_code": messages.ADD_MORE_OFFERS.error_code,
                "error_message": messages.ADD_MORE_OFFERS.error_message
            })
        }
    } catch (error) {
        console.log("Error caught in add more offer API :: " + error)
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

        let { body } = req
        const moreDetails = await service.findOne({ slug: body.slug })
        moreDetails.title == body.title ? null : body.slug = await slug.createSlug(db.MoreOffers, body.title, { slug: await slug.generateSlug(body.title) });
        const response = await service.update({ slug: moreDetails.slug }, body)
        if (response instanceof Error) {
            helper.deliverResponse(res, 422, response, {
                "error_code": messages.serverError.error_code,
                "error_message": messages.serverError.error_message
            })
        } else {
            activity.logActivity(res?.locals?.user?.email, `${body.title} more offer updated`)
            helper.deliverResponse(res, 200, response, {
                "error_code": messages.UPDATE_MORE_OFFERS.error_code,
                "error_message": messages.UPDATE_MORE_OFFERS.error_message
            })
        }
    } catch (error) {
        console.log("Error caught in update more offer API :: " + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.getDetails = async (req, res) => {
    try {
        const { offer } = req.params
        const moreDetails = await service.findOne({ slug: offer })
        helper.deliverResponse(res, 200, moreDetails, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        });
    } catch (error) {
        console.log("Error caught in get more offer details API :: " + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.search = async (req, res) => {
    try {
        const { page, limit, keyword, type } = req.query
        let query = {}
        keyword ? query['keyword'] = { $regex: keyword, $options: 'i' } : null
        type ? query['appliedType'] = type : null
        const response = await service.search(query, {}, { createdAt: -1 }, page, limit)
        helper.deliverResponse(res, 200, response, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        });
    } catch (error) {
        console.log("Error caught in search more offer details API :: " + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}