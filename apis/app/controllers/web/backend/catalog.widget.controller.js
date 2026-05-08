const { body, validationResult } = require("express-validator")
const helper = require('../../../../util/responseHelper')
const service = require("../../../services/catalog.widget.service")
const messages = require('../../../../config/constants').messages
const slug = require('../../../../util/slug')
const db = require('../../../db')

function createReference() {
    return Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
}

exports.add = async (req, res) => {
    try {
        const { body } = req
        body.refid = createReference()
        const widgetReference = async () => {
            const reference = createReference()
            const existingWidgetDetails = await service.findOne({ refid: reference })
            if (existingWidgetDetails) {
                widgetReference()
            } else {
                body.refid = reference
            }
        }
        await widgetReference()
        const widgetResponse = await service.create(body)
        if (widgetResponse instanceof Error) {
            helper.deliverResponse(res, 422, widgetResponse, {
                "error_code": messages.serverError.error_code,
                "error_message": messages.serverError.error_message
            });
        } else {
            helper.deliverResponse(res, 200, widgetResponse, {
                "error_code": messages.WIDGET_ADDED.error_code,
                "error_message": messages.WIDGET_ADDED.error_message
            });
        }
    } catch (error) {
        console.log("Error caught in create home widget api :: " + error)
        helper.deliverResponse(res, 422, error, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.duplicate = async (req, res) => {
    try {
        const { body } = req
        const widgetDetails = await service.findOne({ refid: body.widget }, { _id: 0, __v: 0, createdAt: 0, updatedAt: 0 })
        const widgetReference = async () => {
            const reference = createReference()
            const existingWidgetDetails = await service.findOne({ refid: reference })
            if (existingWidgetDetails) {
                widgetReference()
            } else {
                body.refid = reference
            }
        }
        await widgetReference()
        const widgetResponse = await service.create({ ...widgetDetails?._doc, ...body })
        if (widgetResponse instanceof Error) {
            helper.deliverResponse(res, 422, widgetResponse, {
                "error_code": messages.serverError.error_code,
                "error_message": messages.serverError.error_message
            });
        } else {
            helper.deliverResponse(res, 200, widgetResponse, {
                "error_code": messages.WIDGET_DUPLICATED.error_code,
                "error_message": messages.WIDGET_DUPLICATED.error_message
            });
        }
    } catch (error) {
        console.log("Error caught in duplicate home widget api :: " + error)
        helper.deliverResponse(res, 422, error, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.widgetDetails = async (req, res) => {
    try {
        const { widget } = req.params
        if (widget) {
            const widgetDetails = await service.findOne({ refid: widget })
            helper.deliverResponse(res, 200, widgetDetails, {
                "error_code": messages.successResponse.error_code,
                "error_message": messages.successResponse.error_message
            })
        } else {
            const widgetDetails = await service.find({}, { widgetName: 1, title: 1, refid: 1, visibility: 1, widgetType: 1 }, { index: 1 })
            helper.deliverResponse(res, 200, widgetDetails, {
                "error_code": messages.successResponse.error_code,
                "error_message": messages.successResponse.error_message
            })
        }
    } catch (error) {
        console.log("Error caught in get widget details api :: " + error)
        helper.deliverResponse(res, 422, error, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.delete = async (req, res) => {
    try {
        const { widget } = req.params
        const widgetDetails = await service.delete({ refid: widget })
        helper.deliverResponse(res, 200, widgetDetails, {
            "error_code": messages.WIDGET_DELETED.error_code,
            "error_message": messages.WIDGET_DELETED.error_message
        })
    } catch (error) {
        console.log("Error caught in delete widget api :: " + error)
        helper.deliverResponse(res, 422, error, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.update = async (req, res) => {
    try {
        const { body } = req
        const widgetResponse = await service.update({ refid: body.refid }, body)
        if (widgetResponse instanceof Error) {
            helper.deliverResponse(res, 422, widgetResponse, {
                "error_code": messages.serverError.error_code,
                "error_message": messages.serverError.error_message
            });
        } else {
            helper.deliverResponse(res, 200, {}, {
                "error_code": messages.WIDGET_UPDATED.error_code,
                "error_message": messages.WIDGET_UPDATED.error_message
            });
        }
    } catch (error) {
        console.log("Error caught in create widget api :: " + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.reorderWidgets = async (req, res) => {
    try {
        const { body } = req
        for (let widget of body.widgets) {
            await service.update({ refid: widget.refid }, { index: widget.index })
        }
        helper.deliverResponse(res, 200, {}, {
            "error_code": messages.DRAFT_SAVED.error_code,
            "error_message": messages.DRAFT_SAVED.error_message
        });
    } catch (error) {
        console.log("Error caught in reorder widgets api :: " + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}