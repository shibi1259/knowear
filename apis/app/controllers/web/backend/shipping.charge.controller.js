const { body, validationResult } = require("express-validator");
const helper = require("../../../../util/responseHelper");
const { messages } = require("../../../../config/constants");
const service = require("../../../services/shipping.charge.service");
const adminService = require("../../../services/auth.service")
const activity = require("../../../../util/activity.creator")
const uae = require("../../../../util/emirates")

const getAdminDetails = async (email) => {
    const details = await adminService.adminDetails({ email: email, isActive: true, isDelete: false })
    return details
}

exports.manageCharge = async (req, res) => {
    try {
        const { body } = req
        const { email } = res?.locals?.user
        const chargeDetails = await service.findOne({ city: body.city, country: body.country, isDelete: false })
        if (chargeDetails) {
            const chargeReponse = await service.update({_id: chargeDetails._id}, body)
            if (chargeReponse instanceof Error) {
                helper.deliverResponse(res, 422, {}, {
                    "error_code": messages.serverError.error_code,
                    "error_message": messages.serverError.error_message
                });
            } else {
                activity.logActivity(email, `Shipping charge updated ${body?.isBlacklisted == true ? '( blacklisted )' : ''} for ${body.city}`)
                helper.deliverResponse(res, 200, chargeReponse, {
                    "error_code": messages.SHIPPING_CHARGE_UPDATED.error_code,
                    "error_message": messages.SHIPPING_CHARGE_UPDATED.error_message
                });
            }
        } else {
            const adminDetails = await getAdminDetails(email)
            body.createdBy = adminDetails?._id
            const chargeReponse = await service.create(body)
            if (chargeReponse instanceof Error) {
                helper.deliverResponse(res, 422, {}, {
                    "error_code": messages.serverError.error_code,
                    "error_message": messages.serverError.error_message
                });
            } else {
                activity.logActivity(email, `Shipping charge added for ${body.city}`)
                helper.deliverResponse(res, 200, chargeReponse, {
                    "error_code": messages.SHIPPING_CHARGE_ADDED.error_code,
                    "error_message": messages.SHIPPING_CHARGE_ADDED.error_message
                });
            }
        }
    } catch (error) {
        console.log('Error caught in create add API :: ' + error);
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.getCharges = async (req, res) => {
    try {
        const { country, blacklisted } = req.query
        let query = { country: country, isDelete: false }
        blacklisted == 'true' ? query.isBlacklisted = true : null
        const chargeDetails = await service.find(query, { __v: 0, _id: 0 })
        helper.deliverResponse(res, 200, chargeDetails, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        });
    } catch (error) {
        console.log('Error caught in get charges API :: ' + error);
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.getShippingCity = async (req, res) => {
    try {
        const { country } = req.query
        let shippingCity = []
        switch (country) {
            case 'UAE':
                shippingCity.push(uae.emirates)
                break
            case 'India':
                break
        }
        helper.deliverResponse(res, 200, shippingCity, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        });
    } catch (error) {
        console.log('Error caught in get charges API :: ' + error);
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}