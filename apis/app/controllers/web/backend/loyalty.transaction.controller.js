const { body, validationResult } = require("express-validator")
const service = require("../../../services/loyalty.transaction.service")
const helper = require('../../../../util/responseHelper')
const messages = require('../../../../config/constants').messages
const adminService = require("../../../services/auth.service")
const activity = require("../../../../util/activity.creator")
const settingsService = require("../../../services/general.settings.service")
const userService = require("../../../services/customer.service")
const voucherService = require("../../../services/voucher.service")
const { months } = require('../../../../util/months')

const getAdminDetails = async (email) => {
    const details = await adminService.adminDetails({ email: email, isActive: true, isDelete: false })
    return details
}

exports.validate = (method) => {
    switch (method) {
        case 'create': {
            return [
                body("points", `Points is required`).exists(),
                body("user", `User is required`).exists(),
            ]
        }
    }
}

exports.getTransactions = async (req, res) => {
    try {
        const { customer } = req.params
        const { type } = req.query
        let transactions = []
        const userDetails = await userService.getCustomer({ slug: customer })
        let data = { user: userDetails?._id }
        type ? type == 'credit' ? data.type = 'credit' : type == 'all' ? null : data.type = 'debit' : null
        const loyaltyTransactions = await service.find(data)
        for (let transaction of loyaltyTransactions) {
            transactions.push({
                message: transaction.type == 'credit' ? 'points added' : 'points removed',
                points: transaction.points,
                description: transaction.description,
                type: transaction.type,
                status: transaction.status,
                transactionId: transaction.refid,
                transactionDate: `${months[new Date(transaction.createdAt).getMonth()]} ${new Date(transaction.createdAt).getDate()} ${new Date(transaction.createdAt).getFullYear()}, ${new Date(transaction.createdAt).toLocaleTimeString()}`,
            })
        }
        helper.deliverResponse(res, 200, transactions, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        })
    } catch (error) {
        console.log('Error caught in get loyalty transactions API :: ' + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.loyaltyHistory = async (req, res) => {
    try {
        const { page, limit } = req.query
        const { userid } = res?.locals?.user
        const userDetails = await userService.getCustomer({ userid: userid })
        let data = { user: userDetails?._id }
        const loyaltyTransactions = await service.search(data, {}, { createdAt: -1 }, page, limit)
        helper.deliverResponse(res, 200, {
            loyaltyPoints: userDetails?.loyaltyPoints,
            loyaltyTransactions: loyaltyTransactions
        }, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        })
    } catch (error) {
        console.log('Error caught in loyalty transactions API :: ' + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}