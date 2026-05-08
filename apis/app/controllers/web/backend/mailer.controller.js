const helper = require("../../../../util/responseHelper");
const { messages } = require("../../../../config/constants");
const service = require("../../../services/mailer.service");
const adminService = require("../../../services/auth.service")

exports.manageMailers = async (req, res) => {
    try {
        let { body } = req
        const { email } = res?.locals?.user
        const adminDetails = await adminService.adminDetails({ email: email })
        const mailerDetails = await service.findOne({ refid: '1' })
        let mailerResponse = null
        if (mailerDetails) {
            mailerResponse = await service.update({ refid: '1' }, body)
        } else {
            adminDetails ? body.createdBy = adminDetails?._id : null
            mailerResponse = await service.create(body)
        }

        if (mailerResponse instanceof Error) {
            helper.deliverResponse(res, 200, {}, {
                "error_code": messages.UPDATE_MAILER_FAILED.error_code,
                "error_message": messages.UPDATE_MAILER_FAILED.error_message
            });
        } else {
            helper.deliverResponse(res, 200, mailerResponse, {
                "error_code": messages.UPDATE_MAILER.error_code,
                "error_message": messages.UPDATE_MAILER.error_message
            });
        }
    } catch (error) {
        console.log("Error caught in manage mailer API :: " + error);
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.mailerDetails = async (req, res) => {
    try {
        const mailerDetails = await service.findOne({ refid: '1' }, { _id: 0, __v: 0, createdBy: 0, createdAt: 0, updated: 0 })
        helper.deliverResponse(res, 200, mailerDetails, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        });
    } catch (error) {
        console.log("Error caught in mailer details API :: " + error);
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}