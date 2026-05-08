const { body, validationResult } = require("express-validator")
const service = require("../../../services/banner.service")
const helper = require('../../../../util/responseHelper')
const messages = require('../../../../config/constants').messages
const slug = require('../../../../util/slug')
const db = require('../../../db')
const slugify = require('slugify')
const convertFile = require('../../../../util/base64tofile')
const settingsService = require("../../../services/general.settings.service")
const { BASE_URL } = require("../../../../config/constants/common")

exports.validate = (method) => {
    switch (method) {
        case 'create': {
            return [
                body('validFrom', `From date is required`).exists(),
                body('validTo', `To date is required`).exists(),
            ]
        }
        case 'update': {
            return [
                body('validFrom', `From date is required`).exists(),
                body('validTo', `To date is required`).exists(),
                body('refid', 'Id is required').exists()
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

        let { body } = req
        const settings = await settingsService.findOne({ })
        body.slug = await slug.createSlug(db.HomeBanner, body.title, { slug: await slug.generateSlug(body.title) })
        // if (body.validFrom && body.validTo) {
        //     const today = new Date(new Date().setHours(0, 0, 0, 0))
        //     const from = new Date(body.validFrom)
        //     const to = new Date(body.validTo)
        //     if (from < today) {
        //         helper.deliverResponse(res, 200, {}, {
        //             "error_code": messages.INVALID_FROM_DATE.error_code,
        //             "error_message": messages.INVALID_FROM_DATE.error_message
        //         })
        //     } else if (to < from || to < today) {
        //         helper.deliverResponse(res, 200, {}, {
        //             "error_code": messages.INVALID_TO_DATE.error_code,
        //             "error_message": messages.INVALID_TO_DATE.error_message
        //         })
        //     } else {

        //         for (let banner of body?.files) {
        //             let redirection = ''
        //             let mobileFilePath = null
        //             const filePath = await convertFile(banner?.file, banner?.name, "banner")
        //             if (banner?.mobileFile && banner?.mobileName) {
        //                 mobileFilePath = await convertFile(banner?.file, banner?.name, "banner")
        //             }
        //             switch (banner?.redirection?.type) {
        //                 case 'category':
        //                     redirection = settings?.domain + "/products/" + banner?.redirection?.url
        //                     break
        //                 case 'product':
        //                     redirection = settings?.domain + "/product-detail/" + banner?.redirection?.url
        //                     break
        //                 case 'external':
        //                     redirection = banner?.redirection?.url
        //                     break
        //             }

        //             files.push({
        //                 file: "uploads" + filePath,
        //                 mobileFile: mobileFilePath ? "uploads" + mobileFilePath : null,
        //                 redirection: redirection,
        //                 title: banner?.title
        //             })
        //         }

        //         body.files = files
        //         body.refid = await service.getBannersCount({}) + 1
        //         let homeBanner = await service.createBanner(body)
        //         helper.deliverResponse(res, 200, homeBanner, {
        //             "error_code": messages.LAYOUT_SUCCESS.error_code,
        //             "error_message": messages.LAYOUT_SUCCESS.error_message
        //         })
        //     }
        // } else {
        //     helper.deliverResponse(res, 200, {}, {
        //         "error_code": messages.VALID_DATE.error_code,
        //         "error_message": messages.VALID_DATE.error_message
        //     })
        // }
    } catch (error) {
        console.log("Error caught in create banner API :: " + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.getAllBanner = async (req, res) => {
    try {
        const homeBanner = await service.getAllBanner({})
        helper.deliverResponse(res, 200, homeBanner, {
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

exports.searchBanners = async (req, res) => {
    try {
        const { body } = req
        let data = { isDelete: false }

        if (body?.title) data.title = { $regex: body.title, $options: 'i' }
        if (body?.isActive) data.isActive = body.isActive
        if (body?.validFrom) data['validFrom'] = { $gte: new Date(body?.validFrom).toISOString() }
        if (body?.validTo) data['validFrom'] = { $lte: new Date(body?.validFrom).toISOString() }
        if (body?.validFrom && body?.validFrom) data['$and'] = [
            { validFrom: { $gte: new Date(body?.validFrom).toISOString() } },
            { validFrom: { $lte: new Date(body?.validFrom).toISOString() } }
        ]
        if (body?.type) data.type = body?.type

        const response = await service.getBannersByPage(data, body?.page, body?.limit)
        helper.deliverResponse(res, 200, response, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        })
    } catch (error) {
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.getBannersCount = async (req, res) => {
    try {
        const homeBanner = await service.getBannersCount({ isDelete: false })
        helper.deliverResponse(res, 200, homeBanner, {
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

exports.getActiveBanner = async (req, res) => {
    try {
        const homeBanner = await service.getBanner({ isDelete: false, isActive: true })
        helper.deliverResponse(res, 200, homeBanner)
    } catch (error) {
        helper.deliverResponse(res, 200, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.getBannerBySlug = async (req, res) => {
    try {
        const { slug } = req.query
        const homeBanner = await service.getBannerBySlug(slug)
        helper.deliverResponse(res, 200, homeBanner)
    } catch (error) {
        helper.deliverResponse(res, 200, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.updateHomeBanner = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            helper.deliverResponse(res, 422, errors, {
                "error_code": messages.VALIDATION_ERROR.error_code,
                "error_message": messages.VALIDATION_ERROR.error_code
            })
            return;
        }

        const { body } = req
        let files = []
        const data = await service.getBannerBySlug(body['refid'])
        const settings = await settingsService.findOne({ refid: '1', isDelete: false })
        for (let banner of body?.files) {
            if (banner?.name) {
                let redirection = ''
                let mobileFilePath = null
                const filePath = await convertFile(banner?.file, banner?.name, "banner")
                if (banner?.mobileFile && banner?.mobileName) {
                    mobileFilePath = await convertFile(banner?.file, banner?.name, "banner")
                }
                switch (banner?.redirection?.type) {
                    case 'category':
                        redirection = settings?.domain + "/products/" + banner?.redirection?.url
                        break
                    case 'product':
                        redirection = settings?.domain + "/product-detail/" + banner?.redirection?.url
                        break
                    case 'external':
                        redirection = banner?.redirection?.url
                        break
                }
                files.push({
                    file: "uploads" + filePath,
                    redirection: redirection,
                    title: banner?.title,
                    mobileFile: mobileFilePath ? "uploads" + mobileFilePath : null,
                })
            } else {
                let _banner = {
                    file: banner?.file.split(BASE_URL)[1],
                    redirection: banner?.redirection,
                    title: banner?.title,
                    mobileFile: banner?.mobileFile ? banner?.mobileFile.split(BASE_URL)[1] : null
                }
                files.push(_banner)
            }
        }

        body.files = files
        if (body.title !== data[0].title) body.slug = await slug.createSlug(db.HomeBanner, body?.title, { slug: await slug.generateSlug(body?.title) })
        let response = await service.updateBanner(body['refid'], body)
        helper.deliverResponse(res, 200, response, {
            "error_code": messages.BANNER_UPDATE.error_code,
            "error_message": messages.BANNER_UPDATE.error_message
        })
    } catch (error) {
        console.log(error);
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.getAllBannerImages = async (req, res, next) => {
    try {
        const { body } = req
        let query = { isDelete: false }
        let projection = {}
        if (body['type'] = 1) {
        } else {
        }
    } catch (error) {
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}