const { body, validationResult } = require("express-validator")
const service = require("../../../services/catalog.service")
const catalogWidgetService = require("../../../services/catalog.widget.service")
const helper = require('../../../../util/responseHelper')
const messages = require('../../../../config/constants').messages
const slug = require('../../../../util/slug')
const activity = require('../../../../util/activity.creator')
const db = require('../../../db')

exports.validate = (method) => {
    switch (method) {
        case 'create': {
            return [
                body('title', `Title is required`).exists(),
            ]
        }
    }
}

exports.create = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            helper.deliverResponse(res, 422, errors, {
                error_code: messages.VALIDATION_ERROR.error_code,
                error_message: messages.VALIDATION_ERROR.error_message,
            });
            return;
        }

        let { body } = req;
        body.slug = await slug.createSlug(db.Catalog, body.title, { slug: await slug.generateSlug(body.title) })
        let response = await service.add(body);
        if (response instanceof Error) {
            helper.deliverResponse(res, 422, {}, {
                error_code: messages.serverError.error_code,
                error_message: messages.serverError.error_message,
            });
        } else {
            activity.logActivity(res?.locals?.user?.email, `New catalog created - ${body.title}`)
            helper.deliverResponse(res, 200, response, {
                error_code: messages.CATALOG_ADDED.error_code,
                error_message: messages.CATALOG_ADDED.error_message,
            });
        }
    } catch (error) {
        console.log("Error caught in create catalog API :: " + error);
        helper.deliverResponse(res, 422, {}, {
            error_code: messages.serverError.error_code,
            error_message: messages.serverError.error_message,
        });
    }
}

exports.delete = async (req, res) => {
    try {
        let { catalog } = req.params;
        const catalogDetails = await service.findOne({ slug: catalog })
        const catalogWidgets = await catalogWidgetService.find({ catalog: catalogDetails?._id })
        let response = await service.delete({ slug: catalog });
        if (response instanceof Error) {
            helper.deliverResponse(res, 422, {}, {
                error_code: messages.serverError.error_code,
                error_message: messages.serverError.error_message,
            });
        } else {
            if (catalogWidgets.length > 0) for (let widget of catalogWidgets) await catalogWidgetService.delete({ _id: widget._id })
            activity.logActivity(res?.locals?.user?.email, `${catalogDetails?.title} catalog deleted`)
            helper.deliverResponse(res, 200, response, {
                error_code: messages.CATALOG_DELETED.error_code,
                error_message: messages.CATALOG_DELETED.error_message,
            });
        }
    } catch (error) {
        console.log("Error caught in delete catalog API :: " + error);
        helper.deliverResponse(res, 422, {}, {
            error_code: messages.serverError.error_code,
            error_message: messages.serverError.error_message,
        });
    }
}

exports.update = async (req, res) => {
    try {
        let { body } = req;
        const { catalog } = req.params
        const catalogDetails = await service.findOne({ slug: catalog })
        if (body.title) body.title == catalogDetails.title ? null : body.slug = await slug.createSlug(db.Catalog, body.title, { slug: await slug.generateSlug(body.title) })
        let response = await service.update({ slug: catalog }, body);
        console.log(response);
        if (response instanceof Error) {
            helper.deliverResponse(res, 422, {}, {
                error_code: messages.serverError.error_code,
                error_message: messages.serverError.error_message,
            });
        } else {
            if (body.title) {
                body.title == catalogDetails.title ?
                    activity.logActivity(res?.locals?.user?.email, `${catalogDetails?.title} catalog details updated`) :
                    activity.logActivity(res?.locals?.user?.email, `${catalogDetails?.title} catalog renamed to ${body.title}`)
            } else {
                activity.logActivity(res?.locals?.user?.email, `${catalogDetails?.title} catalog details updated`)
            }
            helper.deliverResponse(res, 200, response, {
                error_code: messages.CATALOG_UPDATED.error_code,
                error_message: messages.CATALOG_UPDATED.error_message,
            });
        }
    } catch (error) {
        console.log("Error caught in update catalog API :: " + error);
        helper.deliverResponse(res, 422, {}, {
            error_code: messages.serverError.error_code,
            error_message: messages.serverError.error_message,
        });
    }
}

exports.getCatalogs = async (req, res) => {
    try {
        const { type } = req.query
        let query = { isDelete: false }
        type == 'draft' ? query['isDraft'] = true : type == 'published' ? query['isPublished'] = true : null
        console.log(query);
        const response = await service.find(query)
        console.log(response);
        helper.deliverResponse(res, 200, response, {
            error_code: messages.successResponse.error_code,
            error_message: messages.successResponse.error_message,
        })
    } catch (error) {
        console.log("Error caught in get catalogs API :: " + error);
        helper.deliverResponse(res, 422, {}, {
            error_code: messages.serverError.error_code,
            error_message: messages.serverError.error_message,
        });
    }
}

exports.getCatalogDetails = async (req, res) => {
    try {
        const { catalog } = req.params
        const catalogDetails = await service.findOne({ slug: catalog })
        const catalogWidgets = await catalogWidgetService.find({ catalog: catalogDetails?._id }, {}, { index: 1 })
        helper.deliverResponse(res, 200, { catalogDetails: catalogDetails?._doc, catalogWidgets: catalogWidgets }, {
            error_code: messages.successResponse.error_code,
            error_message: messages.successResponse.error_message,
        })
    } catch (error) {
        console.log("Error caught in get catalog details API :: " + error);
        helper.deliverResponse(res, 422, {}, {
            error_code: messages.serverError.error_code,
            error_message: messages.serverError.error_message,
        });
    }
}