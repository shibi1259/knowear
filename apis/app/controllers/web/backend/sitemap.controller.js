const helper = require("../../../../util/responseHelper");
const { messages } = require("../../../../config/constants");
const service = require("../../../services/sitemap.service");
const adminService = require("../../../services/auth.service")
const activity = require("../../../../util/activity.creator")

exports.create = async (req, res) => {
    try {
        let { body } = req
        const { email } = res?.locals?.user
        const adminDetails = await adminService.adminDetails({ email: email })
        const sitemaps = await service.find({})
        const sitemapDetails = sitemaps.pop()
        if (body?.sitemap == sitemapDetails?.sitemap) {
            const response = await service.update({ refid: sitemapDetails?.refid }, body)
            if (response instanceof Error) {
                helper.deliverResponse(res, 422, response, {
                    "error_code": messages.serverError.error_code,
                    "error_message": messages.serverError.error_message
                });
            } else {
                activity.logActivity(email, 'Sitemap updated successfully')
                helper.deliverResponse(res, 200, response, {
                    "error_code": messages.SITEMAP_UPDATED.error_code,
                    "error_message": messages.SITEMAP_UPDATED.error_message
                });
            }
        } else {
            body.refid = await service.count({}) + 1
            body.createdBy = adminDetails._id
            const response = await service.create(body)
            if (response instanceof Error) {
                helper.deliverResponse(res, 422, response, {
                    "error_code": messages.serverError.error_code,
                    "error_message": messages.serverError.error_message
                });
            } else {
                activity.logActivity(email, 'Sitemap updated successfully')
                helper.deliverResponse(res, 200, response, {
                    "error_code": messages.SITEMAP_UPDATED.error_code,
                    "error_message": messages.SITEMAP_UPDATED.error_message
                });
            }
        }
    } catch (error) {
        console.log("Error caught in create sitemap API :: " + error)
        helper.deliverResponse(res, 422, error, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}


exports.getSitemaps = async (req, res) => {
    try {
        const sitemaps = await service.find({})
        const sitemapDetails = sitemaps.pop()
        helper.deliverResponse(res, 200, sitemapDetails, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        })
    } catch (error) {
        console.log("Error caught in get sitemaps API :: " + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}