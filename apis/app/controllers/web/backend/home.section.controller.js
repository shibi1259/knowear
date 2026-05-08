const { body, validationResult } = require("express-validator")
const helper = require('../../../../util/responseHelper')
const service = require('../../../services/home.section.service')
const messages = require('../../../../config/constants').messages
const slug = require('../../../../util/slug')
const db = require('../../../db')
const slugify = require('slugify')
const fs = require("fs")
const convertFile = require('../../../../util/base64tofile')
const p_service = require('../../../services/product.service')
const home_service = require("../../../services/home.settings.service")

exports.validate = (method) => {
    switch (method) {
        case 'create': {
            return [
                body('title', `name is required`).exists(),
            ]
        }
        case 'update': {
            return [
                body('title', `name is required`).exists(),
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
        const { body } = req;
        let files = []
        if (body.validTo && body.validFrom) {
            const today = new Date(new Date().setHours(0, 0, 0, 0))
            const from = new Date(body.validFrom)
            const to = new Date(body.validTo)
            if (from < today) {
                helper.deliverResponse(res, 200, {}, {
                    "error_code": messages.INVALID_FROM_DATE.error_code,
                    "error_message": messages.INVALID_FROM_DATE.error_message
                })
            } else if (to < from || to < today) {
                helper.deliverResponse(res, 200, {}, {
                    "error_code": messages.INVALID_TO_DATE.error_code,
                    "error_message": messages.INVALID_TO_DATE.error_message
                })
            } else {
                if (body['files'].length > 0) {
                    for (let file of body.files) {
                        const filepath = await convertFile(file.filestring, file.filename, "layouts")
                        files.push({
                            id: file.id,
                            file: "uploads" + filepath,
                            redirectionURL: file.redirect,
                        })
                    }
                    const code = Math.floor(10000 + Math.random() * 90000);
                    body.layid = "layout_" + code
                    body.files = files
                    let layout = await service.createHomeSection(body)
                    if (layout.isActive == true) {
                        let dashboard_settings = await home_service.getSettings()
                        if (dashboard_settings.length == 0) {
                            let data = {}
                            data['refid'] = 1
                            data['positions'] = {
                                carausel: {
                                    text: layout['title'],
                                    value: 7
                                }
                            }
                            data['positions'] = JSON.stringify(data['positions'])
                            await home_service.createHomeSettingsSettings(data)
                        } else {
                            let dashboard = JSON.parse(dashboard_settings[0]['positions'])
                            if (dashboard) {
                                for (let key of Object.keys(dashboard)) {
                                    if (key != 'carausel') {
                                        dashboard['carausel'] = {
                                            text: layout['title'],
                                            value: 7
                                        }
                                    }
                                }
                            }
                            dashboard = JSON.stringify(dashboard)
                            const data = {
                                refid: dashboard_settings[0]['refid'],
                                positions: dashboard
                            }
                            await home_service.updateHomeSettings(dashboard_settings[0]['refid'], data)
                        }
                    }
                    helper.deliverResponse(res, 200, layout, {
                        "error_code": messages.LAYOUT_SUCCESS.error_code,
                        "error_message": messages.LAYOUT_SUCCESS.error_message,
                    })
                } else {
                    helper.deliverResponse(res, 200, {}, {
                        "error_code": messages.LAYOUT_IMAGE.error_code,
                        "error_message": messages.LAYOUT_IMAGE.error_message,
                    })
                }
            }
        } else {
            helper.deliverResponse(res, 200, {}, {
                "error_code": messages.VALID_DATE.error_code,
                "error_message": messages.VALID_DATE.error_message
            })
        }
    } catch (error) {
        helper.deliverResponse(res, 200, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.getAllHomeSection = async (req, res) => {
    try {
        const homeSection = await service.getAllHomeSection({})
        helper.deliverResponse(res, 200, homeSection)
    } catch (error) {
        helper.deliverResponse(res, 200, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.geLayoutsByPage = async (req, res, next) => {
    try {
        const { page, limit } = req.query
        let layouts = await service.getLayoutByPage(page, limit)
        helper.deliverResponse(res, 200, layouts);
    } catch (error) {
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.geLayoutsCount = async (req, res, next) => {
    try {
        let layouts = await service.getLayoutsCount()
        helper.deliverResponse(res, 200, layouts);
    } catch (error) {
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.getActive = async (req, res) => {
    try {
        const homeSection = await service.getActive({ isDelete: false, isActive: true })
        helper.deliverResponse(res, 200, homeSection)
    } catch (error) {
        helper.deliverResponse(res, 200, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.getBySlug = async (req, res) => {
    try {
        const { slug } = req.query;
        const homeSection = await service.getHomeSection(slug)
        helper.deliverResponse(res, 200, homeSection)
    } catch (error) {
        helper.deliverResponse(res, 200, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.updateHomeSection = async (req, res, next) => {
    try {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            helper.deliverResponse(res, 422, errors, {
                "error_code": messages.VALIDATION_ERROR.error_code,
                "error_message": messages.VALIDATION_ERROR.error_code
            })
            return;
        }
        const { body } = req
        let files = []
        const data = await service.getHomeSection(body['layid'])
        if (body['files'].length > 0) {
            for (let file of body.files) {
                if (!file.file) {
                    const filepath = await convertFile(file.filestring, file.filename, "layouts")
                    files.push({
                        id: file.id,
                        file: "uploads" + filepath,
                        redirect: file.redirect,
                    })
                } else {
                    files.push(file)
                }
            }
            if (body.title !== data[0].title) {
                body.slug = await slugify(body.title, {
                    replacement: "-",
                    remove: undefined,
                    lower: true,
                    strict: false,
                    locale: 'vi',
                    trim: true
                })
            }
            body.files = files
            let homeSection = await service.updateHomeSection(body['layid'], body)
            if (homeSection.isActive == true) {
                let dashboard_settings = await home_service.getSettings()
                if (dashboard_settings.length == 0) {
                    let data = {}
                    data['refid'] = 1
                    data['positions'] = {
                        carausel: {
                            text: homeSection['title'],
                            value: 7
                        }
                    }
                    data['positions'] = JSON.stringify(data['positions'])
                    await home_service.createHomeSettingsSettings(data)
                } else {
                    let dashboard = JSON.parse(dashboard_settings[0]['positions'])
                    if (dashboard) {
                        for (let key of Object.keys(dashboard)) {
                            if (key != 'carausel') {
                                dashboard['carausel'] = {
                                    text: homeSection['title'],
                                    value: 7
                                }
                            }
                        }
                    }
                    dashboard = JSON.stringify(dashboard)
                    const data = {
                        refid: dashboard_settings[0]['refid'],
                        positions: dashboard
                    }
                    await home_service.updateHomeSettings(dashboard_settings[0]['refid'], data)
                }
            }
            helper.deliverResponse(res, 200, homeSection, {
                "error_code": messages.LAYOUT_UPDATE.error_code,
                "error_message": messages.LAYOUT_UPDATE.error_message
            })
        } else {
            helper.deliverResponse(res, 200, {}, {
                "error_code": messages.LAYOUT_IMAGE.error_code,
                "error_message": messages.LAYOUT_IMAGE.error_message,
            })
        }
    } catch (error) {
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}