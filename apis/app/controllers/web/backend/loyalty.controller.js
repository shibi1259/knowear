const helper = require("../../../../util/responseHelper");
const { messages } = require("../../../../config/constants");
const service = require("../../../services/loyalty.service");
const adminService = require("../../../services/auth.service")
const activity = require("../../../../util/activity.creator")

exports.manageLoyalty = async (req, res) => {
    try {
        const { body } = req
        const { email } = res?.locals?.user
        const adminDetails = await adminService.adminDetails({ email: email })
        const loyaltyDetails = await service.findOne({ slug: 'loyalty-points' })
        if (loyaltyDetails) {
            body.createdBy = adminDetails?._id
            const loyaltyResponse = await service.update({ slug: 'loyalty-points' }, body)
            if (loyaltyResponse instanceof Error) {
                helper.deliverResponse(res, 422, {}, {
                    "error_code": messages.serverError.error_code,
                    "error_message": messages.serverError.error_message
                });
            } else {
                activity.logActivity(res?.locals?.user?.email, `New loyalty details updated`)
                helper.deliverResponse(res, 200, loyaltyResponse, {
                    "error_code": messages.LOYALTY_UPDATED.error_code,
                    "error_message": messages.LOYALTY_UPDATED.error_message
                });
            }
        } else {
            const loyaltyResponse = await service.create(body)
            if (loyaltyResponse instanceof Error) {
                helper.deliverResponse(res, 422, {}, {
                    "error_code": messages.serverError.error_code,
                    "error_message": messages.serverError.error_message
                });
            } else {
                activity.logActivity(res?.locals?.user?.email, `New loyalty details created`)
                helper.deliverResponse(res, 200, loyaltyResponse, {
                    "error_code": messages.LOYALTY_UPDATED.error_code,
                    "error_message": messages.LOYALTY_UPDATED.error_message
                });
            }
        }
    } catch (error) {
        console.log('Error caught in manage loyalty API :: ' + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.loyaltyDetails = async (req, res) => {
    try {
        const loyaltyDetails = await service.findOne({ slug: 'loyalty-points' }, { _id: 0, __v: 0, createdBy: 0 })
        helper.deliverResponse(res, 200, loyaltyDetails, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        });
    } catch (error) {
        console.log('Error caught in loyalty details API :: ' + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}