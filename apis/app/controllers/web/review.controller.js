const helper = require('../../../util/responseHelper')
const messages = require('../../../config/constants').messages
const service = require('../../services/review.service')
const productService = require('../../services/product.service')
const orderService = require('../../services/order.service')
const userService = require('../../services/customer.service')
const { body, validationResult } = require("express-validator");

exports.validate = (method) => {
    switch (method) {
        case "add": {
            return [
                body("product", "Product is required").exists(),
                body("order", "Order is required").exists(),
                body("rating", "Rating is required").exists(),
                body("message", "Message is required").exists(),
            ];
        }
        case "update": {
            return [
                body("product", "Product is required").exists(),
                body("quantity", "Quantity is required").exists(),
            ];
        }
        case "remove": {
            return [
                body("product", "Product is required").exists()
            ];
        }
    }
};

exports.add = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            helper.deliverResponse(res, 422, errors, {
                "error_code": messages.VALIDATION_ERROR.error_code,
                "error_message": messages.VALIDATION_ERROR.error_message
            });
            return;
        }

        const { body } = req
        const { userid } = res?.locals?.user
        const orderDetails = await orderService.getOrderDetails({ orderNo: body?.order })
        const productDetails = await productService.getSingleProduct({ slug: body?.product })

        let reviewDetails = await service.getSingleReview({ 'customer.refid': userid, 'product.refid': productDetails?.prodid, isDelete: false })
        let response = {}

        if (!reviewDetails) {
            body.order = { id: orderDetails?._id, refid: orderDetails?.refid }
            if (userid == orderDetails?.customerId?.userid) body.customer = { id: orderDetails?.customerId?._id, refid: orderDetails?.customerId?.userid }
            body.product = { id: productDetails?._id, refid: productDetails?.prodid }
            body.refid = await service.getReviewCount({}) + 1
            body.isActive = false
            console.log(body);
            response = await service.createReview(body)
        } else {
            let payload = { rating: body?.rating, message: body?.message }
            response = await service.updateReview({ _id: reviewDetails?._id }, payload)
            if (reviewDetails?.isActive == true) {
                const aggregate = [
                    { '$match': { 'product.id': productDetails?._id, isActive: true, isDelete: false } },
                    { '$project': { 'rating': { '$toDouble': '$rating' } } },
                    {
                        '$group': {
                            '_id': null,
                            'ratings': { '$push': '$rating' },
                            'totalRatings': { '$sum': 1 },
                            'ratingSum': { '$sum': '$rating' }
                        },
                    }
                ]

                const reviews = await service.getReviewByAgg(aggregate)
                const ratings = reviews[0]?.ratingSum
                const totalRatings = reviews[0]?.totalRatings
                let newRating = ratings / totalRatings
                let productRating = 0
                reviews.length > 0 ? productRating = newRating : productRating = 0
                await productService.updateProduct(productDetails?.prodid, { rating: productRating })
            }
        }

        if (response) {
            helper.deliverResponse(res, 200, {}, {
                "error_code": messages.USER_REVIEW.error_code,
                "error_message": messages.USER_REVIEW.error_message
            });
        }

    } catch (error) {
        console.log(error);
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

