const helper = require("../../../../util/responseHelper");
const { messages } = require("../../../../config/constants");
const service = require("../../../services/custom.mailer.service");
const adminService = require("../../../services/auth.service")
const activity = require("../../../../util/activity.creator")

exports.manage = async (req, res) => {
    try {
        let { body } = req
        const { email } = res?.locals?.user
        const adminDetails = await adminService.adminDetails({ email: email })
        body.slug = body.type
        body.createdBy = adminDetails._id
        const mailerDetails = await service.findOne({ type: body.type })
        if (mailerDetails) {
            const response = await service.update({ type: body.type }, body)
            if (response instanceof Error) {
                helper.deliverResponse(res, 422, {}, {
                    "error_code": messages.serverError.error_code,
                    "error_message": messages.serverError.error_message
                });
            } else {
                activity.logActivity(email, `Updated ${body.type} mailer details`)
                helper.deliverResponse(res, 200, {}, {
                    "error_code": messages.MAILER_UPDATED.error_code,
                    "error_message": messages.MAILER_UPDATED.error_message
                });
            }
        } else {
            const response = await service.create(body)
            if (response instanceof Error) {
                helper.deliverResponse(res, 422, {}, {
                    "error_code": messages.serverError.error_code,
                    "error_message": messages.serverError.error_message
                });
            } else {
                activity.logActivity(email, `Created ${body.type} mailer details`)
                helper.deliverResponse(res, 200, {}, {
                    "error_code": messages.MAILER_CREATED.error_code,
                    "error_message": messages.MAILER_CREATED.error_message
                });
            }
        }
    } catch (error) {
        console.log('Error caught in create custom mailer API :: ' + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.findOne = async (req, res) => {
    try {
        const { type } = req.query
        const mailerDetails = await service.findOne({ type: type })
        helper.deliverResponse(res, 200, mailerDetails, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        });
    } catch (error) {
        console.log('Error caught in find mailer API :: ' + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}