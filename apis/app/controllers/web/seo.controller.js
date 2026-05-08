const { body, validationResult } = require("express-validator");
const helper = require("../../../util/responseHelper");
const { messages } = require("../../../config/constants");
const service = require("../../services/seo.service");
const { BASE_URL } = require("../../../config/constants/common");

exports.details = async (req, res) => {
    try {
        const { page } = req.query
        const response = await service.findOne({ page: page, isActive: true, isDelete: false })
        console.log(response);
        helper.deliverResponse(res, 200, { ...response?._doc, thumbnail: `${response?.thumbnail ? BASE_URL + response?.thumbnail?.path : null}` }, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        });
    } catch (error) {
        helper.deliverResponse(res, 422, error, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}