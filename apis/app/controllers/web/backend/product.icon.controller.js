const helper = require("../../../../util/responseHelper");
const { messages } = require("../../../../config/constants");
const service = require("../../../services/product.icon.service");
const adminService = require("../../../services/auth.service")
const activity = require("../../../../util/activity.creator")
const { months } = require("../../../../util/months")
const productService = require("../../../services/product.service")

exports.create = async (req, res) => {
    try {
        const { body } = req
        const { email } = res?.locals?.user
        const productDetails = await productService.getProductDetails({ slug: body.product })
        const iconDetails = await service.findOne({ product: productDetails?._id })
        if (iconDetails) {
            const productResponse = await service.update({ product: productDetails?._id }, { medias: body.medias })
            if (productResponse instanceof Error) {
                helper.deliverResponse(res, 422, {}, {
                    "error_code": messages.serverError.error_code,
                    "error_message": messages.serverError.error_message
                });
            } else {
                activity.logActivity(email, `Product ${productDetails.name} icon updated`)
                helper.deliverResponse(res, 200, {}, {
                    "error_code": messages.PRODUCT_ICON_UPDATED.error_code,
                    "error_message": messages.PRODUCT_ICON_UPDATED.error_message
                });
            }
        } else {
            const productResponse = await service.create({ product: productDetails?._id, medias: body.medias })
            if (productResponse instanceof Error) {
                helper.deliverResponse(res, 422, {}, {
                    "error_code": messages.serverError.error_code,
                    "error_message": messages.serverError.error_message
                });
            } else {
                activity.logActivity(email, `Product ${productDetails.name} icon updated`)
                helper.deliverResponse(res, 200, {}, {
                    "error_code": messages.PRODUCT_ICON_ADDED.error_code,
                    "error_message": messages.PRODUCT_ICON_ADDED.error_message
                });
            }
        }
    } catch (error) {
        console.log('Error caught in create product icon API :: ' + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.getIcons = async (req, res) => {
    try {
        const { product } = req.params
        const productDetails = await service.find({ product: product })
        helper.deliverResponse(res, 200, productDetails, {
            "error_code": messages.SUCCESS.error_code,
            "error_message": messages.SUCCESS.error_message,
        });
    } catch (error) {
        console.log('Error caught in get product icon API :: ' + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.delete = async (req, res) => {
    try {
        const { email } = res?.locals?.user
        const { product } = req.params
        const productDetails = await productService.getProductDetails({ slug: product })
        const iconDetails = await service.delete({ product: productDetails._id })
        if (iconDetails instanceof Error) {
            helper.deliverResponse(res, 422, {}, {
                "error_code": messages.serverError.error_code,
                "error_message": messages.serverError.error_message
            });
            return;
        } else {
            activity.logActivity(email, `Product ${productDetails.name} icons deleted`)
            helper.deliverResponse(res, 200, {}, {
                "error_code": messages.PRODUCT_ICON_DELETED.error_code,
                "error_message": messages.PRODUCT_ICON_DELETED.error_message
            });
            return;
        }
    } catch (error) {
        console.log('Error caught in delete product icon API :: ' + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}