const { BASE_URL } = require("../../config/constants/common");
const settingsService = require("../../app/services/general.settings.service");
const service = require("../../app/services/collection.service");
const productService = require("../../app/services/product.service");
const customerService = require("../../app/services/customer.service");
const cartService = require("../../app/services/cart.service");
const { getAttributes } = require("../../util/getAttributes");
const { getProductResponse } = require("../productResponse");

exports.createProducts = async (widgetDetails, userid, type, deviceToken) => {
    try {
        let products = []
        let cartDetails = null;

        const [customerDetails, settings] = await Promise.all([
            customerService.getCustomerDetails({ userid: userid }),
            settingsService.findOne({ })
        ]);

        if (userid) {
            cartDetails = await cartService.getCart({ 'customer.refid': userid, isPurchased: false, isDelete: false, isActive: true })
        } else {
            cartDetails = await cartService.getCart({ 'deviceToken': deviceToken, isPurchased: false, isDelete: false, isActive: true })
        }

        if (type == 'products') {
            for (let product of widgetDetails?.products) {
                const productRespone = getProductResponse(product, settings)
                products.push(productRespone);
            }
            return {
                title: widgetDetails?.title,
                titleImage: widgetDetails?.titleImage ? BASE_URL + widgetDetails?.titleImage?.path : null,
                description: widgetDetails?.description,
                button: { text: widgetDetails?.buttonText, link: widgetDetails?.buttonLink },
                products: products,
                productAd: {
                    redirection: widgetDetails?.productsAdRedirection,
                    thumbnail: widgetDetails?.productsAdThumbnail ? BASE_URL + widgetDetails?.productsAdThumbnail?.path : null
                },
                type: widgetDetails?.widgetType
            }
        } else {
            const collectionDetails = await service.findOne({ _id: widgetDetails?.collections?._id })
            if (collectionDetails?.products.length > 0) {
                for (let product of collectionDetails?.products) {
                    const productDetails = await productService.getProductDetails({ _id: product?._id })
                    const percentageOff = Math.round(((product?.price?.mrp - product?.price?.selling) / product?.price?.mrp) * 100);
                    let offerExists = productDetails?.offerExists || false;
                    let isFavourite = false;
                    if (customerDetails) { }
                    products.push({
                        name: { text: product?.name },
                        params: { slug: product?.slug, proid: product?.prodid },
                        thumbnail: BASE_URL + productDetails?.thumbnail?.path,
                        price: { text: `${settings?.currency} ${product?.price?.selling}` },
                        actual_price: { text: `${settings?.currency} ${product?.price?.mrp}` },
                        cart: { isCart: false, quantity: 0 },
                        favourite: { status: isFavourite },
                        origin: { text: product?.origin },
                        
                        category: { text: productDetails?.category?.id[0]?.name },
                        inStock: product?.stock > 0 ? true : false,
                        isSubscribed: false,
                        productTags: {
                            topRightTag: productDetails["productTags"]["topRightTag"]?.path
                                ? BASE_URL + productDetails["productTags"]["topRightTag"]?.path
                                : null,
                            topLeftTag: productDetails["productTags"]["topLeftTag"]?.path
                                ? BASE_URL + productDetails["productTags"]["topLeftTag"]?.path
                                : null,
                            bottomLeftTag: productDetails["productTags"]["bottomLeftTag"]?.path
                                ? BASE_URL + productDetails["productTags"]["bottomLeftTag"]?.path
                                : null,
                            bottomRightTag: productDetails["productTags"]["bottomRightTag"]?.path
                                ? BASE_URL + productDetails["productTags"]["bottomRightTag"]?.path
                                : null,
                        },
                        description: { text: product?.overview },
                        category: { text: product.category.id[0].name },
                        percentage_off: { text: offerExists && percentageOff > 0 ? `${percentageOff}` : null },
                        style: { radius: product?.style?.radius, background: product?.style?.background, border: product?.style?.border }
                    })
                }
                return {
                    title: collectionDetails?.title,
                    description: collectionDetails?.description,
                    button: { text: "View more", link: "/products" },
                    params: { slug: collectionDetails?.slug },
                    products: products,
                    type: widgetDetails?.widgetType
                }
            }
        }

    } catch (error) {
        console.log("error caught in create products  " + error)
    }
}