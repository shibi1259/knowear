const helper = require('../../../../util/responseHelper')
const { body, validationResult } = require('express-validator')
const messages = require('../../../../config/constants').messages
const service = require('../../../services/page.covers.service')

const pageCoversExits = async (path, _id) => {
    try {
        let query = { path: path, isDelete: false }
        _id ? query['$ne'] = { _id: _id } : null
        const isExists = await service.findOne(query)
        return isExists ? true : false
    } catch (error) {
        return false
    }
}

exports.createCovers = async (req, res) => {
    try {
        const { body } = req
        const isExists = await pageCoversExits(body?.path, null)
        if (isExists) {
            helper.deliverResponse(res, 422, {}, {
                "error_code": messages.PAGECOVER_EXISTS.error_code,
                "error_message": messages.PAGECOVER_EXISTS.error_message
            });
        } else {
            const response = await service.create(body)
            if (response instanceof Error) {
                helper.deliverResponse(res, 422, response, {
                    "error_code": messages.serverError.error_code,
                    "error_message": messages.serverError.error_message
                });
            } else {
                helper.deliverResponse(res, 200, response, {
                    "error_code": messages.PAGECOVER_ADDED.error_code,
                    "error_message": messages.PAGECOVER_ADDED.error_message
                });
            }
        }
    } catch (error) {
        console.error('Error caught in create covers :: ' + error);
        helper.deliverResponse(res, 422, error, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.pageCovers = async (req, res) => {
    try {
        const { body } = req
        let query = { isDelete: false }
        body?.isActive ? query['isActive'] = true : null
        body?.path ? query['path'] = body?.path : null
        const response = await service.find(query)
        helper.deliverResponse(res, 200, response, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        });
    } catch (error) {
        console.error('Error caught in page covers :: ' + error);
        helper.deliverResponse(res, 422, error, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.pageCoverDetails = async (req, res) => {
    try {
        const { id } = req.params
        const response = await service.findOne({ _id: id })
        helper.deliverResponse(res, 200, response, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        });
    } catch (error) {
        console.error('Error caught in page covers :: ' + error);
        helper.deliverResponse(res, 422, error, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.updateCovers = async (req, res) => {
    try {
        const { body } = req
        const isExists = await pageCoversExits(body?.path, body?._id)
        if (isExists) {
            helper.deliverResponse(res, 422, {}, {
                "error_code": messages.PAGECOVER_EXISTS.error_code,
                "error_message": messages.PAGECOVER_EXISTS.error_message
            });
        } else {
            const response = await service.update({ _id: body?._id }, body)
            if (response instanceof Error) {
                helper.deliverResponse(res, 422, response, {
                    "error_code": messages.serverError.error_code,
                    "error_message": messages.serverError.error_message
                });
            } else {
                helper.deliverResponse(res, 200, response, {
                    "error_code": messages.PAGECOVER_UPDATED.error_code,
                    "error_message": messages.PAGECOVER_UPDATED.error_message
                });
            }
        }
    } catch (error) {
        console.error('Error caught in update covers :: ' + error);
        helper.deliverResponse(res, 422, error, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.deletePageCover = async (req, res) => {
    try {
        const { id } = req.params
        const response = await service.update({ _id: id }, { isDelete: true })
        helper.deliverResponse(res, 200, response, {
            "error_code": messages.PAGECOVER_DELETED.error_code,
            "error_message": messages.PAGECOVER_DELETED.error_message
        });
    } catch (error) {
        console.error('Error caught in page covers :: ' + error);
        helper.deliverResponse(res, 422, error, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}
