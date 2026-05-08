const customerReportService = require("../../../services/customer.report.service")
const helper = require('../../../../util/responseHelper')
const { body, validationResult } = require('express-validator')
const messages = require('../../../../config/constants').messages
const db = require('../../../db')
const slug = require("../../../../util/slug");
const orderSerice = require('../../../services/order.service')
const service = require("../../../services/customer.service")

exports.validate = (method) => {
    switch (method) {
        case 'create': {
            return [
            ]
        }
        case 'update': {
            return [
            ]
        }
    }
}

exports.create = async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            helper.deliverResponse(res, 422, errors, {
                "error_code": messages.VALIDATION_ERROR.error_code,
                "error_message": messages.VALIDATION_ERROR.error_message
            })
            return;
        }
        const body = req.body
        let customerReport = await customerReportService.createCustomerReport(body)
        helper.deliverResponse(res, 200, customerReport)
    } catch (error) {
        helper.deliverResponse(res, 200, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.getAllCustomerReports = async (req, res) => {
    try {
        const customers = await service.getCustomer({ isActive: true, isDelete: false })
        const response = []
        for (let customer of customers) {
            const id = customer['_id']
            const orders = await orderSerice.getOrderByCustomer(id)
            response.push({
                customer: customer['name'],
                mobile: customer['mobile'],
                email: customer['email'],
                city: customer['address']['city'],
                pincode: customer['address']['pincode'],
                state: customer['address']['state'],
                orders: orders,
                address: customer['address']['firstline'] + " " + customer['address']['secondline'] + " " +
                    customer['address']['area'] + " " +
                    customer['address']['landmark'] + " " +
                    customer['address']['city'] + " " +
                    customer['address']['pincode'] + " " +
                    customer['address']['state']
            })
        }
        helper.deliverResponse(res, 200, response, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        })
    } catch (error) {
        helper.deliverResponse(res, 200, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.getActiveCustomerReport = async (req, res) => {
    try {
        const customerReport = await customerReportService.getActiveCustomerReport({ isDelete: false, isActive: true })
        helper.deliverResponse(res, 200, customerReport)
    } catch (error) {
        helper.deliverResponse(res, 200, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.getReportByCustomer = async (req, res) => {
    try {
        const { body } = req
        const customers = await service.getClient(body)
        const response = []
        for (let customer of customers) {
            const id = customer['_id']
            const orders = await orderSerice.getOrderByCustomer(id)
            response.push({
                customer: customer['name'],
                mobile: customer['mobile'],
                email: customer['email'],
                city: customer['address']['city'],
                pincode: customer['address']['pincode'],
                state: customer['address']['state'],
                orders: orders,
                address: customer['address']['firstline'] + " " + customer['address']['secondline'] + " " +
                    customer['address']['area'] + " " +
                    customer['address']['landmark'] + " " +
                    customer['address']['city'] + " " +
                    customer['address']['pincode'] + " " +
                    customer['address']['state']
            })
        }
        helper.deliverResponse(res, 200, response, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        })
    } catch (error) {
        helper.deliverResponse(res, 200, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.updateCustomerReport = async (req, res, next) => {
    try {
        const errors = validationResult(req)

        if (!errors) {
            helper.deliverResponse(res, 422, errors, {
                "error_code": messages.VALIDATION_ERROR.error_code,
                "error_message": messages.VALIDATION_ERROR.error_message
            })
            return;
        }
        const body = req.body
        const { id } = req.query

        let customerReport = await customerReportService.updateCustomerReport(id, body)
        helper.deliverResponse(res, 200, customerReport)
    } catch (error) {
        helper.deliverResponse(res, 200, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}