const helper = require('../../../util/responseHelper')
const messages = require('../../../config/constants').messages
const service = require('../../services/enquiry.service')
const mailer = require("../../../util/sendMail")
const templates = require("../../../util/templates")
const settingsService = require("../../services/general.settings.service");

const notificationToaAdmin = async (body, settings) => {
    const subject = `New enquiry form submitted`
    const content = `New enquiry form submitted`
    const template = await templates.enquirySubmission(body, settings)
    await mailer.sendMail('', subject, content, template)
}

const notificationToUser = async (body, settings) => {
    const subject = `Thank your for your enquiry`
    const content = `Thank your for your enquiry`
    const template = templates.enquiryThanking(body, settings)
    await mailer.sendMail(body?.email, subject, content, template)
}

exports.add = async (req, res) => {
    try {
        const { body } = req
        const settings = await settingsService.findOne({})
        const response = await service.add(body)
        if (response instanceof Error) {
            helper.deliverResponse(res, 422, {}, {
                error_code: messages.serverError.error_code,
                error_message: messages.serverError.error_message,
            });
        } else {
            Promise.all([notificationToaAdmin(body, settings), notificationToUser(body, settings)])
            helper.deliverResponse(res, 200, {}, {
                error_code: messages.ENQUIRY_SUBMIT.error_code,
                error_message: messages.ENQUIRY_SUBMIT.error_message,
            });
        }
    } catch (_error) {
        console.log("Error caught in add enquiry :: " + _error);
        helper.deliverResponse(res, 422, {}, {
            error_code: messages.serverError.error_code,
            error_message: messages.serverError.error_message,
        });
    }
}