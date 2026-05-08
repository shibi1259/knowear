const helper = require("../../../../util/responseHelper");
const { messages } = require("../../../../config/constants");
const service = require("../../../services/referral.service");
const adminService = require("../../../services/auth.service")
const activity = require("../../../../util/activity.creator")
const customerService = require("../../../services/customer.service")
const orderService = require("../../../services/order.service")
const { months } = require("../../../../util/months")

exports.manageReferral = async (req, res) => {
    try {
        const { body } = req
        const { email } = res?.locals?.user
        const adminDetails = await adminService.adminDetails({ email: email })
        const referralDetails = await service.findOne({ slug: 'referral' })
        if (referralDetails) {
            body.createdBy = adminDetails?._id
            const referralResponse = await service.update({ slug: 'referral' }, body)
            if (referralResponse instanceof Error) {
                helper.deliverResponse(res, 422, {}, {
                    "error_code": messages.serverError.error_code,
                    "error_message": messages.serverError.error_message
                });
            } else {
                activity.logActivity(res?.locals?.user?.email, `Referral program details updated`)
                helper.deliverResponse(res, 200, referralResponse, {
                    "error_code": messages.REFERRAL_UPDATED.error_code,
                    "error_message": messages.REFERRAL_UPDATED.error_message
                });
            }
        } else {
            const referralResponse = await service.create(body)
            if (referralResponse instanceof Error) {
                helper.deliverResponse(res, 422, {}, {
                    "error_code": messages.serverError.error_code,
                    "error_message": messages.serverError.error_message
                });
            } else {
                activity.logActivity(res?.locals?.user?.email, `Referral program details created`)
                helper.deliverResponse(res, 200, referralResponse, {
                    "error_code": messages.REFERRAL_UPDATED.error_code,
                    "error_message": messages.REFERRAL_UPDATED.error_message
                });
            }
        }
    } catch (error) {
        console.log('Error caught in manage referral API :: ' + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.referralDetails = async (req, res) => {
    try {
        const referralDetails = await service.findOne({ slug: 'referral' }, { _id: 0, __v: 0, createdAt: 0, updatedAt: 0, createdBy: 0 })
        helper.deliverResponse(res, 200, referralDetails, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        });
    } catch (error) {
        console.log('Error caught in referral details API :: ' + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.invitedCustomers = async (req, res) => {
    try {
        const { body } = req
        let data = { "referralSource.user": { $exists: true } }
        if (body.keyword) data['name'] = { $regex: body.keyword, $options: 'i' }
        const items = await customerService.searchCustomers(data, body?.page, body?.limit, {})
        let invitedCustomers = []
        for (let item of items?.data) {
            const orders = await orderService.getOrderByCustomer(item._id)
            invitedCustomers.push({
                name: item.name,
                email: item.email,
                userid: item.userid,
                countryCode: item.countryCode,
                mobile: item.mobile,
                invitedBy: {
                    name: item.referralSource?.user?.name,
                    userid: item.referralSource?.user?.userid,
                },
                orders: orders,
                createdAt: `${months[new Date(item.createdAt).getMonth()]} ${new Date(item.createdAt).getDate()} ${new Date(item.createdAt).getFullYear()}`,
            })
        }
        helper.deliverResponse(res, 200, {
            totalPages: items.totalPages,
            page: items.page,
            limit: items.limit,
            isLastPage: items.lastPage,
            totalResults: items.totalCustomers,
            data: invitedCustomers
        }, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        });
    } catch (error) {
        console.log('Error caught in invited customers API :: ' + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}