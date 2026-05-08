const service = require("../../../services/apps.service")
const helper = require('../../../../util/responseHelper')
const { BASE_URL } = require("../../../../config/constants/common")
const messages = require('../../../../config/constants').messages

exports.manage = async (req, res) => {
    try {
        const { body } = req
        const details = await service.findOne({ refid: '1' })
        if (details) {
            const response = await service.update({ refid: '1' }, body)
            if (response instanceof Error) {
                helper.deliverResponse(res, 422, {}, {
                    "error_code": messages.serverError.error_code,
                    "error_message": messages.serverError.error_message
                });
            } else {
                helper.deliverResponse(res, 200, response, {
                    "error_code": messages.ADD_APPS.error_code,
                    "error_message": messages.ADD_APPS.error_message
                });
            }
        } else {
            body.refid = '1'
            const response = await service.create(body)
            if (response instanceof Error) {
                helper.deliverResponse(res, 422, {}, {
                    "error_code": messages.serverError.error_code,
                    "error_message": messages.serverError.error_message
                });
            } else {
                helper.deliverResponse(res, 200, response, {
                    "error_code": messages.ADD_APPS.error_code,
                    "error_message": messages.ADD_APPS.error_message
                });
            }
        }
    } catch (error) {
        console.log('Error caught in manage mobile apps :: ' + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.apps = async (req, res) => {
    try {
        let details = await service.findOne({ refid: '1' })
        helper.deliverResponse(res, 200, details, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        });
    } catch (error) {
        console.log('Error caught in apps API :: ' + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.appDetails = async (req, res) => {
    try {
        let details = await service.findOne({ refid: '1' }, { __v: 0, createdAt: 0, updatedAt: 0, refid: 0, _id: 0 })
        details.android.appIcon = BASE_URL + details.android.appIcon
        details.ios.appIcon = BASE_URL + details.ios.appIcon
        details.android.splashIcon = BASE_URL + details.android.splashIcon
        details.ios.splashIcon = BASE_URL + details.ios.splashIcon
        helper.deliverResponse(res, 200, details, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        });
    } catch (error) {
        console.log('Error caught in apps API :: ' + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.manageAppIcon = async (req, res) => {
    try {
        const { body } = req
        const details = await service.findOne({ refid: '1' })
        if (body?.type == 'android') {
            let payload = {
                android: { ...details?.android, appIcon: req.file.path }
            }
            const response = await service.update({ refid: '1' }, payload)
            if (response instanceof Error) {
                helper.deliverResponse(res, 422, {}, {
                    "error_code": messages.serverError.error_code,
                    "error_message": messages.serverError.error_message
                });
            } else {
                helper.deliverResponse(res, 200, response, {
                    "error_code": messages.APP_ICON.error_code,
                    "error_message": messages.APP_ICON.error_message
                });
            }
        } else if (body?.type == 'ios') {
            let payload = {
                ios: { ...details?.ios, appIcon: req.file.path }
            }
            const response = await service.update({ refid: '1' }, payload)
            if (response instanceof Error) {
                helper.deliverResponse(res, 422, {}, {
                    "error_code": messages.serverError.error_code,
                    "error_message": messages.serverError.error_message
                });
            } else {
                helper.deliverResponse(res, 200, response, {
                    "error_code": messages.APP_ICON.error_code,
                    "error_message": messages.APP_ICON.error_message
                });
            }
        }
    } catch (error) {
        console.log('Error caught in manage app icon API :: ' + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.managSplashIcon = async (req, res) => {
    try {
        const { body } = req
        const details = await service.findOne({ refid: '1' })
        if (body?.type == 'android') {
            let payload = {
                android: { ...details?.android, splashIcon: req.file.path }
            }
            const response = await service.update({ refid: '1' }, payload)
            if (response instanceof Error) {
                helper.deliverResponse(res, 422, {}, {
                    "error_code": messages.serverError.error_code,
                    "error_message": messages.serverError.error_message
                });
            } else {
                helper.deliverResponse(res, 200, response, {
                    "error_code": messages.APP_ICON.error_code,
                    "error_message": messages.APP_ICON.error_message
                });
            }
        } else if (body?.type == 'ios') {
            let payload = {
                ios: { ...details?.ios, splashIcon: req.file.path }
            }
            const response = await service.update({ refid: '1' }, payload)
            if (response instanceof Error) {
                helper.deliverResponse(res, 422, {}, {
                    "error_code": messages.serverError.error_code,
                    "error_message": messages.serverError.error_message
                });
            } else {
                helper.deliverResponse(res, 200, response, {
                    "error_code": messages.APP_ICON.error_code,
                    "error_message": messages.APP_ICON.error_message
                });
            }
        }
    } catch (error) {
        console.log('Error caught in manage app icon API :: ' + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}