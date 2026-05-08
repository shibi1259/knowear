const service = require("../../services/page.covers.service")
const helper = require('../../../util/responseHelper')
const { BASE_URL } = require("../../../config/constants/common")
const messages = require('../../../config/constants').messages

exports.getPageCovers = async (req, res) => {
    try {
        let pageCoverDetails = []
        const pagecovers = await service.find({ isDelete: false, isActive: true })
        for (let pagecover of pagecovers) {
            pageCoverDetails.push({
                path: pagecover?.path,
                desktopCover: pagecover?.desktopCover ? BASE_URL + pagecover?.desktopCover?.path : null,
                mobileCover: pagecover?.mobileCover ? BASE_URL + pagecover?.mobileCover?.path : null,
            })
        }
        helper.deliverResponse(res, 200, pageCoverDetails, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        });
    } catch (error) {
        console.log("Error caught in get page covers web :: " + error)
        helper.deliverResponse(res, 422, error, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}