const helper = require('../../../../util/responseHelper')
const { body, validationResult } = require('express-validator')
const messages = require('../../../../config/constants').messages
const service = require('../../../services/blog.service')
const slug = require('../../../../util/slug')
const db = require('../../../db')
const adminService = require("../../../services/auth.service")
const activity = require("../../../../util/activity.creator")
const media = require("../../../../util/media.uploader")

const getAdminDetails = async (email) => {
    const details = await adminService.adminDetails({ email: email, isActive: true, isDelete: false })
    return details
}

exports.validate = (method) => {
    switch (method) {
        case 'create': {
            return [
                body('title', `Title is required`).exists(),
                body('description', `Description is required`).exists(),
            ]
        }
        case 'update': {
            return [
                body('title', `Title is required`).exists(),
                body('description', `Description is required`).exists(),
                body('slug', `Blog is required`).exists(),
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

        const adminEmail = res?.locals?.user?.email
        const admin = await getAdminDetails(adminEmail)
        const { body } = req;
        body.createdBy = admin?._id
        body.slug = await slug.createSlug(db.Blog, body.title, { slug: await slug.generateSlug(body.title) });
        let response = await service.create(body)
        if (response instanceof Error) {
            helper.deliverResponse(res, 422, response, {
                "error_code": messages.serverError.error_code,
                "error_message": messages.serverError.error_message
            });
        } else {
            activity.logActivity(adminEmail, `${body.title} blog created`)
            helper.deliverResponse(res, 200, response, {
                "error_code": messages.CREATE_BLOG.error_code,
                "error_message": messages.CREATE_BLOG.error_message
            });
        }
    } catch (error) {
        console.log('Error caught in create blog API :: ' + error);
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

        const adminEmail = res?.locals?.user?.email
        const { body } = req;
        const blogDetails = await service.findOne({ slug: body.slug })
        blogDetails.title == body.title ? null : body.slug = await slug.createSlug(db.Blog, body.title, { slug: await slug.generateSlug(body.title) });
        let response = await service.update({ slug: blogDetails.slug }, body)
        if (response instanceof Error) {
            helper.deliverResponse(res, 422, response, {
                "error_code": messages.serverError.error_code,
                "error_message": messages.serverError.error_message
            });
        } else {
            activity.logActivity(adminEmail, `${body.title} blog updated`)
            helper.deliverResponse(res, 200, response, {
                "error_code": messages.UPDATE_BLOG.error_code,
                "error_message": messages.UPDATE_BLOG.error_message
            });
        }
    } catch (error) {
        console.log('Error caught in update blog API :: ' + error);
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.delete = async (req, res) => {
    try {
        const { blog } = req.params
        const response = await service.update({ slug: blog }, { isDelete: true })
        if (response instanceof Error) {
            helper.deliverResponse(res, 422, response, {
                "error_code": messages.serverError.error_code,
                "error_message": messages.serverError.error_message
            });
        } else {
            helper.deliverResponse(res, 200, response, {
                "error_code": messages.DELETE_BLOG.error_code,
                "error_message": messages.DELETE_BLOG.error_message
            });
        }
    } catch (error) {
        console.log('Error caught in delete blog API :: ' + error);
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

        const { body } = req;
        let data = { isDelete: false }
        if (body.keyword) data['title'] = { $regex: body.keyword, $options: 'i' }
        if (body.date) data['$and'] = [
            { createdAt: { $lte: new Date(new Date(body.date).setHours(23, 59, 59, 59)).toISOString() } },
            { createdAt: { $gte: new Date(new Date(body.date).setHours(0, 0, 0, 0)).toISOString() } }
        ]
        let response = await service.search(data, { description: 0, cover: 0 }, body.page, body.limit)
        helper.deliverResponse(res, 200, response, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        });
    } catch (error) {
        console.log('Error caught in search blogs API :: ' + error);
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.details = async (req, res) => {
    try {
        const { blog } = req.params;
        let response = await service.findOne({ slug: blog })
        helper.deliverResponse(res, 200, response, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        });
    } catch (error) {
        console.log('Error caught in search blogs API :: ' + error);
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}