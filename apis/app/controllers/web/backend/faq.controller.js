const { body, validationResult } = require("express-validator")
const service = require("../../../services/faq.service")
const helper = require('../../../../util/responseHelper')
const messages = require('../../../../config/constants').messages

exports.create = async (req, res) => {
    try {
        let response = await service.create(req.body)
        if (response instanceof Error) {
            helper.deliverResponse(res, 422, response, messages.serverError);
        } else {
            helper.deliverResponse(res, 200, response, messages.successResponse);
        }
    } catch (error) {
        console.log("Error caught in create faq :: ", error);
        helper.deliverResponse(res, 422, {}, messages.serverError);
    }
}

exports.getFaqs = async (req, res) => {
    try {
        const response = await service.find({ isDelete: false })
        helper.deliverResponse(res, 200, response, messages.successResponse)
    } catch (error) {
        helper.deliverResponse(res, 422, {},  messages.serverError);
    }
}

exports.activeFaqs = async (req, res) => {
    try {
        const response = await service.find({ isActive: true, isDelete: false })
        helper.deliverResponse(res, 200, response, messages.successResponse)
    } catch (error) {
        helper.deliverResponse(res, 422, {}, messages.serverError);
    }
}

exports.faqDetails = async (req, res) => {
    try {
        const { faqId } = req.params
        const response = await service.findOne({ _id: faqId })
        helper.deliverResponse(res, 200, response, messages.successResponse)
    } catch (error) {
        helper.deliverResponse(res, 422, {}, messages.serverError);
    }
}

exports.update = async (req, res) => {
    try {
        let response = await service.update({ _id: req.params.faqId }, req.body)
        if (response instanceof Error) {
            helper.deliverResponse(res, 422, response, messages.serverError);
        } else {
            helper.deliverResponse(res, 200, response, messages.successResponse);
        }
    } catch (error) {
        helper.deliverResponse(res, 422, error, messages.serverError);
    }
}

exports.delete = async (req, res) => {
    try {
        const { faqId } = req.params
        let response = await service.update({ _id: faqId }, { isDelete: true })
        helper.deliverResponse(res, 200, response, messages.successResponse)
    } catch (error) {
        helper.deliverResponse(res, 422, {}, messages.serverError);
    }
}
