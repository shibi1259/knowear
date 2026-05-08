const { body, validationResult } = require("express-validator");
const helper = require("../../../../util/responseHelper");
const { messages } = require("../../../../config/constants");
const service = require("../../../services/menu.service");
const adminService = require("../../../services/auth.service")

const getAdminDetails = async (email) => {
    const details = await adminService.adminDetails({ email: email, isActive: true, isDelete: false })
    return details
}

exports.validate = (method) => {
    switch (method) {
        case 'add': {
            return [
                body('title', `Title is required`).exists(),
                body('menuType', `Type is required`).exists(),
                body('redirection', `Redirection is required`).exists(),
            ]
        }
        case 'update': {
            return [
                body('title', `Title is required`).exists(),
                body('menuType', `Type is required`).exists(),
                body('redirection', `Redirection is required`).exists(),
                body('refid', `Refid is required`).exists(),
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
        const adminEmail = res?.locals?.user?.email
        const admin = await getAdminDetails(adminEmail)
        body.refid = await service.count({}) + 1
        body.createdBy = admin?._id
        let response = await service.create(body)
        if (response instanceof Error) {
            helper.deliverResponse(res, 422, response, {
                "error_code": messages.serverError.error_code,
                "error_message": messages.serverError.error_message
            });
        } else {
            helper.deliverResponse(res, 200, response, {
                "error_code": messages.ADD_MENU.error_code,
                "error_message": messages.ADD_MENU.error_message
            });
        }
    } catch (error) {
        console.log('Error caught in add menu API :: ' + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.rearrange = async (req, res) => {
    try {
        const { body } = req
        const errorResponses = [];
        for (let item of body.items) {
            const response = await service.update({ refid: item.refid }, { index: item.index })
            if (response instanceof Error) {
                errorResponses.push(response)
            }
        }

        if (errorResponses.length > 0) {
            helper.deliverResponse(res, 422, errorResponses, {
                "error_code": messages.serverError.error_code,
                "error_message": messages.serverError.error_message
            });
        } else {
            helper.deliverResponse(res, 200, {}, {
                "error_code": messages.MENU_REARRANGED.error_code,
                "error_message": messages.MENU_REARRANGED.error_message
            });
        }
    } catch (error) {
        console.log('Error caught in rearrange menu API :: ' + error)
        helper.deliverResponse(res, 422, error, {
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
        let response = await service.update({ refid: body?.refid }, body)
        if (response) {
            helper.deliverResponse(res, 200, response, {
                "error_code": messages.ADD_MENU.error_code,
                "error_message": messages.ADD_MENU.error_message
            });
        }
    } catch (error) {
        console.log('Error caught in update menu API :: ' + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.getMenuItems = async (req, res) => {
    try {
        let { type } = req?.query
        let query = { isDelete: false }
        type == 'active' ? query['isActive'] = true : query['isActive'] = false
        let response = await service.find(query)
        helper.deliverResponse(res, 200, response, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        });
    } catch (error) {
        console.log('Error caught in get menu items API  :: ' + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.getMenuItemDetails = async (req, res) => {
    try {
        const { menu } = req?.params
        let response = await service.findOne({ refid: menu, isDelete: false, isActive: true })
        helper.deliverResponse(res, 200, response, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        });
    } catch (error) {
        console.log('Error caught in get menu item details API  :: ' + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}