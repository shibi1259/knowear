const orderReportService = require("../../../services/order.report.service")
const helper = require('../../../../util/responseHelper')
const { body, validationResult } = require('express-validator')
const messages = require('../../../../config/constants').messages
const db = require('../../../db')
const slug = require("../../../../util/slug");

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
        let orderReport = await orderReportService.createOrderReport(body)
        helper.deliverResponse(res, 200, orderReport)
    } catch (error) {
        helper.deliverResponse(res, 200, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.getAllOrderReports = async (req, res) => {
    try {
        const orderReport = await orderReportService.getAllOrderReport({})
        const resp = []
        for (let data of orderReport) {
            resp.push({
                ordernumber: data.order.orderNo,
                orderdate: new Date(data.order.orderDate).toDateString(),
                orderstatus: data.order.orderStatus,
                paymentmethod: data.order.paymentMethod,
                tax: data.order.tax,
                shippingcost: data.order.shippingCost,
                total: data.order.total,
                customer: data.order.customerId.name,
                totalitems: data.order.product.length
            })
        }
        helper.deliverResponse(res, 200, resp)
    } catch (error) {
        helper.deliverResponse(res, 200, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.getActiveOrderReport = async (req, res) => {
    try {
        const orderReport = await orderReportService.getActiveOrderReport({ isDelete: false, isActive: true })
        helper.deliverResponse(res, 200, orderReport)
    } catch (error) {
        helper.deliverResponse(res, 200, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.getReportByCustomer = async (req,res) => {
    try{
        const {customer} = req.query;
        const orderReport = await orderReportService.getActiveOrderReport({customer:customer})
        helper.deliverResponse(res,200,orderReport)
    } catch(error) {
        helper.deliverResponse(res, 200, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });

    }
}

exports.getReportByStatus = async (req,res) => {
    try{
        const {status} = req.query;
        const orderReport = await orderReportService.getActiveOrderReport({status:status.toUpperCase()})
        helper.deliverResponse(res,200,orderReport)
    } catch(error) {
        helper.deliverResponse(res, 200, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.getReportByStatusAndCustomer = async (req,res) => {
    try{
        const {s} = req.query;
        const {c} = req.query;

        const orderReport = await orderReportService.getActiveOrderReport({status : s.toUpperCase(), customer : c })
        helper.deliverResponse(res,200,orderReport)
    } catch (error) {
        helper.deliverResponse(res, 200, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.getOrderByDate = async (req,res) => {
    try{
        const {ld,ud} = req.query;
        const lDate = (new Date(ld))
        const uDate = (new Date(ud))
        console.log("ld,ud",lDate,uDate);
        const orderReport = await orderReportService.getActiveOrderReport({date: {$gte:lDate, $lte:uDate} })
        helper.deliverResponse(res,200,orderReport)
    } catch (error) {
        helper.deliverResponse(res, 200, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });  
    }
}

exports.getReportByCustomerAndDate = async (req,res) => {
    try{
        const {ld,ud} = req.query;
        const {c} = req.query;
        const ldate = (new Date(ld)).toString();
        const udate = (new Date(ud)).toString();

        const orderReport = await orderReportService.getActiveOrderReport({customer:c, date: {$gte:ldate, $lte:udate }})
        helper.deliverResponse(res,200,orderReport)
    } catch (error) {
        helper.deliverResponse(res, 200, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });   
    }
}

exports.getReportByStatusAndDate = async (req,res) => {
    try{
        const {ld,ud} = req.query;
        const {s} = req.query;
        const lDate = (new Date(ld)).toString();
        const uDate = (new Date(ud)).toString();

        const orderReport = await orderReportService.getActiveOrderReport({status:s.toUpperCase(), date: {$gte:lDate, $lte:uDate}})
        helper.deliverResponse(res,200,orderReport)
    } catch (error) {
        helper.deliverResponse(res, 200, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });   
    }
}

exports.getReportByCustomerAndDateAndStatus = async (req,res) => {
    try{
        const {ld,ud} = req.query;
        const {s} = req.query;
        const {c} = req.query;
        const lDate = (new Date(ld)).toString()
        const uDate = (new Date(ud)).toString()

        const orderReport = await orderReportService.getActiveOrderReport({status:s.toUpperCase(),customer:c ,date:{$gte:lDate,$lte:uDate}})
        helper.deliverResponse(res,200,orderReport)
    } catch(error) {
        helper.deliverResponse(res, 200, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}


exports.updateOrderReport = async (req, res, next) => {
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

        let orderReport = await orderReportService.updateOrderReport(id, body)
        helper.deliverResponse(res, 200, orderReport)
    } catch (error) {
        helper.deliverResponse(res, 200, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}