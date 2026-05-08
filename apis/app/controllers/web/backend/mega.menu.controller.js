const helper = require("../../../../util/responseHelper");
const { messages } = require("../../../../config/constants");
const service = require("../../../services/mega.menu.service");
const adminService = require("../../../services/auth.service");
const settingsService = require("../../../services/general.settings.service");
const { BASE_URL } = require("../../../../config/constants/common");

const getAdminDetails = async (email) => {
    const details = await adminService.adminDetails({ email: email, isActive: true, isDelete: false })
    return details
}

exports.create = async (req, res) => {
    const { body } = req
    const { email } = res?.locals?.user
    const adminDetails = await getAdminDetails(email)
    body.createdBy = adminDetails?._id
    const response = await service.create(body)
    if (response instanceof Error) {
        helper.deliverResponse(res, 422, response, {
            error_code: messages.serverError.error_code,
            error_message: messages.serverError.error_message
        });
    } else {
        helper.deliverResponse(res, 200, response, {
            error_code: messages.ADD_MENU.error_code,
            error_message: messages.ADD_MENU.error_message
        });
    }
}

exports.update = async (req, res) => {
    const { body } = req
    const response = await service.update({ _id: body._id }, body)
    if (response instanceof Error) {
        helper.deliverResponse(res, 422, response, {
            error_code: messages.serverError.error_code,
            error_message: messages.serverError.error_message
        });
    } else {
        helper.deliverResponse(res, 200, response, {
            error_code: messages.UPDATE_MENU.error_code,
            error_message: messages.UPDATE_MENU.error_message
        });
    }
}

exports.rearrange = async (req, res) => {
    const { body } = req
    const errorResponses = [];
    for (let item of body.items) {
        const response = await service.update({ _id: item._id }, { index: item.index })
        if (response instanceof Error) {
            errorResponses.push(response)
        }
    }

    if (errorResponses.length > 0) {
        helper.deliverResponse(res, 422, errorResponses, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    } else {
        helper.deliverResponse(res, 200, {}, {
            "error_code": messages.MENU_REARRANGED.error_code,
            "error_message": messages.MENU_REARRANGED.error_message
        });
    }
}

exports.find = async (req, res) => {
    const response = await service.find({})
    helper.deliverResponse(res, 200, response, messages.successResponse);
}

exports.findOne = async (req, res) => {
    const response = await service.findOne({ _id: req.params.menuId })
    helper.deliverResponse(res, 200, response, {
        error_code: messages.successResponse.error_code,
        error_message: messages.successResponse.error_message
    });
}

exports.delete = async (req, res) => {
    const response = await service.delete({ _id: req.params.menuId })
    helper.deliverResponse(res, 200, response, {
        error_code: messages.DELETE_MENU.error_code,
        error_message: messages.DELETE_MENU.error_message
    });
}

exports.menu = async (req, res) => {
    const response = await service.find({})
    let menuDetails = []
    const settings = await settingsService.findOne({ refid: '1' })
    const websiteUrl = settings?.domain.endsWith('/') ? settings?.domain : settings?.domain + '/';
    for (let responseItem of response) {
        let appRedirection = responseItem.redirection && responseItem.redirection.split('websiteUrl')[1]
        menuDetails.push({
            title: responseItem.title,
            icon: responseItem.icon && `${BASE_URL}${responseItem.icon}`,
            redirection: responseItem.redirection,
            appRedirection: {
                params: responseItem.redirection
            },
            advertisement: responseItem.advertisement && `${BASE_URL}${responseItem.advertisement}`,
            advertisementMobile: responseItem.advertisementMobile && `${BASE_URL}${responseItem.advertisementMobile}`,
            advertisementRedirection: responseItem.advertisementRedirection,
            subMenus: responseItem.subMenus,
        })
    }
    return helper.deliverResponse(res, 200, menuDetails, messages.successResponse);
}