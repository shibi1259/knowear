const { body, validationResult } = require("express-validator");
const helper = require("../../../../util/responseHelper");
const { messages } = require("../../../../config/constants");
const service = require("../../../services/role.service");
const slug = require('../../../../util/slug')
const db = require('../../../db')
const adminService = require("../../../services/auth.service")
const permissionsService = require("../../../services/permission.service")

const getAdminDetails = async (email) => {
    const details = await adminService.adminDetails({ email: email, isActive: true, isDelete: false })
    return details
}

exports.validate = (method) => {
    switch (method) {
        case 'manage-role': {
            return [
                body('name', `Name is required`).exists(),
                body('permissions', `Permissions is required`).exists(),
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

exports.addRole = async (req, res) => {
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
        const adminEmail = res?.locals?.user?.email
        const admin = await getAdminDetails(adminEmail)
        body.createdBy = admin?._id
        body.slug = await slug.createSlug(db.Role, body?.name, { slug: await slug.generateSlug(body?.name) });
        const response = await service.createRole(body);
        if (response instanceof Error) {
            helper.deliverResponse(res, 422, response, {
                "error_code": messages.serverError.error_code,
                "error_message": messages.serverError.error_message
            });
        } else {
            helper.deliverResponse(res, 200, response, {
                "error_code": messages.ADD_ROLE.error_code,
                "error_message": messages.ADD_ROLE.error_message
            });
        }
    } catch (error) {
        console.log("error caught in add role api :: ", error)
        helper.deliverResponse(res, 422, error, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.getRoles = async (req, res, next) => {
    try {
        let role = await service.getRoles({ isDelete: false })
        helper.deliverResponse(res, 200, role, {
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

exports.getRoleDetails = async (req, res, next) => {
    try {
        const { role } = req?.params
        let roleDetails = await service.getRoleDetails({ isDelete: false, _id: role })
        helper.deliverResponse(res, 200, roleDetails, {
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

exports.getActiveRoles = async (req, res, next) => {
    try {
        let roles = await service.getRoles({ isDelete: false, isActive: true })
        helper.deliverResponse(res, 200, roles, {
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

exports.searchRoles = async (req, res, next) => {
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
        if (body?.keyword) data['name'] = { $regex: body?.keyword, $options: 'i' }
        if (body?.isActive) data['isActive'] = body?.isActive
        let response = await service.searchRoles(data, body?.page, body?.limit, {}, {createdAt: -1})
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

exports.updateRole = async (req, res, next) => {
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
        const roleDetails = await service.getRoleDetails({ _id: body?._id })
        const admins = await adminService.getAdmins({ role: roleDetails?._id, isDelete: false })
        if (body.name != roleDetails?.name) body.slug = await slug.createSlug(db.Role, body?.name, { slug: await slug.generateSlug(body?.name) })
        if (body?.isActive == 'false') {
            if (admins.length > 0) {
                helper.deliverResponse(res, 200, {}, {
                    "error_code": messages.FAILED_ROLE_UPDATE.error_code,
                    "error_message": messages.FAILED_ROLE_UPDATE.error_message
                })
            } else {
                const response = await service.updateRole({ _id: body?._id }, body)
                if (response instanceof Error) {
                    helper.deliverResponse(res, 422, response, {
                        "error_code": messages.serverError.error_code,
                        "error_message": messages.serverError.error_message
                    });
                } else {
                    helper.deliverResponse(res, 200, response, {
                        "error_code": messages.UPDATE_ROLE.error_code,
                        "error_message": messages.UPDATE_ROLE.error_message
                    });
                }
            }
        } else {
            const response = await service.updateRole({ _id: body?._id }, body)
            if (response instanceof Error) {
                helper.deliverResponse(res, 422, response, {
                    "error_code": messages.serverError.error_code,
                    "error_message": messages.serverError.error_message
                });
            } else {
                helper.deliverResponse(res, 200, response, {
                    "error_code": messages.UPDATE_ROLE.error_code,
                    "error_message": messages.UPDATE_ROLE.error_message
                });
            }
        }
    } catch (error) {
        console.log('Error caught in update role API :: ' + error)
        helper.deliverResponse(res, 422, error, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}