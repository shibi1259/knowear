const helper = require('../../../../util/responseHelper')
const { body, validationResult } = require('express-validator')
const messages = require('../../../../config/constants').messages
const service = require("../../../services/review.service")
const productService = require("../../../services/product.service")
const orderService = require("../../../services/order.service")
const customerService = require("../../../services/customer.service")

exports.validate = (method) => {
   switch (method) {
      case 'search': {
         return [
            body('page', 'Page is required').exists(),
            body('limit', 'Limit is required').exists(),
         ]
      }
      case 'update': {
         return [
            body('refid', 'Id is required').exists(),
         ]
      }
      case 'product-reviews': {
         return [
            body('product', 'Product is required').exists(),
         ]
      }
   }
}

exports.updateReview = async (req, res) => {
   try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
         helper.deliverResponse(res, 422, errors, {
            "error_code": messages.VALIDATION_ERROR.error_code,
            "error_message": messages.VALIDATION_ERROR.error_message
         })
         return;
      }

      const { body } = req
      const { action } = req.query
      const review = await service.getSingleReview({ refid: body?.refid, isDelete: false })
      let data = {}

      switch (action) {
         case 'update':
            review?.isActive ? data['isActive'] = false : data['isActive'] = true
            break
         case 'delete':
            data.isDelete = true
            break
      }

      const reviewResponse = await service.updateReview({ refid: body?.refid }, data)
      if (reviewResponse) {
         const productDetails = await productService.getSingleProduct({ _id: review?.product?.id })
         const aggregate = [
            { '$match': { 'product.id': review?.product?.id, isActive: true, isDelete: false } },
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

         helper.deliverResponse(res, 200, {}, {
            "error_code": messages.UPDATE_REVIEW.error_code,
            "error_message": messages.UPDATE_REVIEW.error_message
         })
      }
   } catch (error) {
      console.log("Error caught while updating review :: " + error);
      helper.deliverResponse(res, 422, {}, {
         "error_code": messages.serverError.error_code,
         "error_message": messages.serverError.error_message
      });
   }
}

exports.searchReviews = async (req, res, next) => {
   try {
      const { body } = req
      let orderIds = []
      let customerIds = []
      let productIds = []
      let data = { isDelete: false }
      if (body?.keyword) {
         let query = [{ 'message': { '$regex': body.keyword, '$options': 'i' } }]
         const orders = await orderService.getOrdersData({ orderNo: { $regex: body?.keyword, $options: 'i' } }, { _id: 1, refid: 1 })
         for (let order of orders) orderIds.push(order?._id)
         const products = await productService.getAllProduct({ name: { $regex: body?.keyword, $options: 'i' } })
         for (let product of products) productIds.push(product?._id)
         const customers = await customerService.getClient({ name: { $regex: body?.keyword, $options: 'i' } })
         for (let customer of customers) customerIds.push(customer?._id)
         if (orderIds.length > 0) query.push({ 'order.id': { $in: orderIds } })
         if (customerIds.length > 0) query.push({ 'customer.id': { $in: customerIds } })
         if (productIds.length > 0) query.push({ 'product.id': { $in: productIds } })
         data['$or'] = query
      }
      if (body?.isActive) data['isActive'] = body?.isActive
      if (body?.fromDate) data['created'] = { $gte: new Date(new Date(body?.fromDate).setHours(0, 0, 0, 0)) }
      if (body?.toDate) data['created'] = { $lte: new Date(new Date(body?.toDate).setHours(23, 59, 59, 999)) }
      if (body?.fromDate && body?.toDate) data['created'] = {
         $gte: new Date(new Date(body?.fromDate).setHours(0, 0, 0, 0)),
         $lte: new Date(new Date(body?.toDate).setHours(23, 59, 59, 999))
      }
      const projection = { __v: 0, isDelete: 0, updatedAt: 0, _id: 0 }

      const response = await service.searchReviews(data, body?.page, body?.limit, projection)
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

exports.productReviews = async (req, res,) => {
   try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
         helper.deliverResponse(res, 422, errors, {
            "error_code": messages.VALIDATION_ERROR.error_code,
            "error_message": messages.VALIDATION_ERROR.error_message
         })
         return;
      }

      const { body } = req
      let data = { 'product.refid': body.product, isDelete: false }
      if (body?.keyword) data['message'] = { $regex: body?.keyword, $options: 'i' }
      const reviews = await service.productReviews(data, { __v: 0, updatedAt: 0, _id: 0 })
      helper.deliverResponse(res, 200, reviews, {
         "error_code": messages.successResponse.error_code,
         "error_message": messages.successResponse.error_message
      })
   } catch (error) {
      console.log('Error caught in product reviews API :: ' + error)
      helper.deliverResponse(res, 422, {}, {
         "error_code": messages.serverError.error_code,
         "error_message": messages.serverError.error_message
      });
   }
}