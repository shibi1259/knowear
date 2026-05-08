const service = require("../../../services/footer.service")
const helper = require('../../../../util/responseHelper')
const messages = require('../../../../config/constants').messages

exports.manageFooter = async (req, res) => {
    try {
        let { body } = req
        const footerDetails = await service.findOne({ isActive: true, isDelete: false })
        if (footerDetails) {
            const footer = await service.update({ _id: footerDetails?._id }, body)
            if (footer instanceof Error) {
                helper.deliverResponse(res, 422, footer, {
                    "error_code": messages.serverError.error_code,
                    "error_message": messages.serverError.error_message
                });
            } else {
                helper.deliverResponse(res, 200, footer, {
                    "error_code": messages.UPDATE_CONTENT.error_code,
                    "error_message": messages.UPDATE_CONTENT.error_message
                });
            }
        } else {
            const footer = await service.create(body)
            if (footer instanceof Error) {
                helper.deliverResponse(res, 422, footer, {
                    "error_code": messages.serverError.error_code,
                    "error_message": messages.serverError.error_message
                });
            } else {
                helper.deliverResponse(res, 200, footer, {
                    "error_code": messages.ADD_CONTENT.error_code,
                    "error_message": messages.ADD_CONTENT.error_message
                });
            }
        }
    } catch (error) {
        console.log('Error caught in manage footer API :: ' + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.getFooter = async (req, res) => {
    try {
        const footerDetails = await service.findOne({ isActive: true, isDelete: false })
        helper.deliverResponse(res, 200, footerDetails, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        })
    } catch (error) {
        console.log('Error caught in get footer API :: ' + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

// Add/Update specific section links
exports.manageSectionLinks = async (req, res) => {
    try {
        const { section } = req.params
        const { links } = req.body

        const footerDetails = await service.findOne({})
        if (!footerDetails) {
            helper.deliverResponse(res, 404, {}, {
                "error_code": messages.NOT_FOUND.error_code,
                "error_message": messages.NOT_FOUND.error_message
            });
            return;
        }

        const updateQuery = {};
        updateQuery[`${section}Links`] = links;

        const footer = await service.update({ _id: footerDetails._id }, updateQuery)
        if (footer instanceof Error) {
            helper.deliverResponse(res, 422, footer, {
                "error_code": messages.serverError.error_code,
                "error_message": messages.serverError.error_message
            });
        } else {
            helper.deliverResponse(res, 200, footer, {
                "error_code": messages.UPDATE_CONTENT.error_code,
                "error_message": messages.UPDATE_CONTENT.error_message
            });
        }
    } catch (error) {
        console.log('Error caught in manage section links API :: ' + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}