const { body, validationResult } = require("express-validator")
const service = require("../../services/more.offers.service")
const cartService = require("../../services/cart.service")
const parentService = require("../../services/product.head.service")
const helper = require('../../../util/responseHelper')
const messages = require('../../../config/constants').messages
const productService = require("../../services/product.service")
const settingsService = require("../../services/general.settings.service")
const { BASE_URL } = require("../../../config/constants/common")

exports.moreOffers = async (req, res) => {
    try {
        const { cart } = req.query
        const cartDetails = await cartService.getCart({ cartid: cart })
        let moreOffers = []
        let dateQuery = new Date(new Date().setHours(0, 0, 0, 0)).toUTCString()
        for (let product of cartDetails.products) {
            const productDetails = await productService.getProductDetails({ slug: product.product.slug })
            let categories = []
            if (product?.product?.product?.id?.brand) {
                const appliedDetails = await service.find({
                    appliedBrand: product?.product?.product?.id?.brand?._id,
                    endDate: { $gte: dateQuery }, startDate: { $lte: dateQuery }
                })
                for (let offerDetails of appliedDetails) {
                    moreOffers.push({
                        title: offerDetails.title,
                        description: offerDetails.description,
                        slug: offerDetails.slug,
                        type: offerDetails.appliedType,
                        redirection: offerDetails.appliedType == 'product' ? offerDetails?.applicableProduct?.slug : null,
                        thumbnail: offerDetails.thumbnail ? BASE_URL + offerDetails.thumbnail.path : null,
                    })
                }
            }
            const appliedProductDetails = await service.find({
                appliedProduct: product?.product?._id,
                endDate: { $gte: dateQuery }, startDate: { $lte: dateQuery }
            })
            for (let offerDetails of appliedProductDetails) {
                moreOffers.push({
                    title: offerDetails.title,
                    description: offerDetails.description,
                    slug: offerDetails.slug,
                    type: offerDetails.appliedType,
                    redirection: offerDetails.appliedType == 'product' ? offerDetails?.applicableProduct?.slug : null,
                    thumbnail: offerDetails.thumbnail ? BASE_URL + offerDetails.thumbnail.path : null,
                })
            }
        }
        helper.deliverResponse(res, 200, moreOffers, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message,
        });

    } catch (error) {
        console.log('Error caught in more offers web api :: ' + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

const offerAlreadyExists = (offers, offerId) => {

}

exports.moreOffersListing = async (req, res) => {
    try {
        const { body } = req
        const { userid, devicetoken } = res?.locals?.user
        const moreDetails = await service.findOne({ slug: body.slug })
        const settings = await settingsService.findOne({ })
        let productDetails = {}
        let products = []
        switch (moreDetails.appliedType) {
            case 'category':
                break
            case 'brand':
                let parentIds = []
                const parents = await parentService.find({ brand: moreDetails.applicableBrand._id })
                parentIds = parents.map(parent => parent._id)
                const productItems = await productService.getProductBySearch({ 'product.id': { $in: parentIds } }, body.page, body.limit, {}, { createdAt: -1 })
                for (let product of productItems.data) {
                    products.push({
                        title: { text: product.name },
                        actual_price: { text: `${settings.currency} ${product.price.mrp}` },
                        price: { text: `${settings.currency} ${product.price.selling}` },
                        params: { slug: product.slug, prodid: product.prodid },
                        style: product.style,
                        
                    })
                }
                productDetails = { ...productItems, data: products }
                break
        }
        helper.deliverResponse(res, 200, {
            offerDetails: moreDetails,
            productDetails: productDetails
        }, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        });
    } catch (error) {
        console.log('Error caught in more offers listing web api :: ' + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}