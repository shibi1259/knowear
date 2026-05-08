const { body, validationResult } = require("express-validator")
const service = require("../../../services/return.service")
const helper = require('../../../../util/responseHelper')
const orderService = require("../../../services/order.service")
const mailerService = require("../../../services/mailer.service")
const productService = require("../../../services/product.service")
const messages = require('../../../../config/constants').messages
const adminService = require("../../../services/auth.service")
const activity = require("../../../../util/activity.creator")
const userService = require("../../../services/customer.service")
const settingsService = require("../../../services/general.settings.service")
const templates = require("../../../../util/templates")
const mailer = require("../../../../util/sendMail")
const { BASE_URL } = require("../../../../config/constants/common")
const { months } = require("../../../../util/months")

const getAdminDetails = async (email) => {
   const details = await adminService.adminDetails({ email: email, isActive: true, isDelete: false })
   return details
}

exports.validate = (method) => {
   switch (method) {
      case 'create': {
         return [
            body("order", `Order is required`).exists(),
            body("product", `Product is required`).exists(),
            body("reason", `Reason is required`).exists(),
         ]
      }
      case 'update': {
         return [
            body("reference", `Return reference is required`).exists(),
         ]
      }
      case 'search': {
         return [
            body("page", `Page is required`).exists(),
            body("limit", `Limit is required`).exists(),
         ]
      }
   }
}

const generateReference = () => {
   const orderID = Math.floor(100000000 + Math.random() * 900000000);
   return orderID.toString();
};

exports.create = async (req, res) => {
   try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
         helper.deliverResponse(res, 422, errors, {
            "error_code": messages.VALIDATION_ERROR.error_code,
            "error_message": messages.VALIDATION_ERROR.error_message
         })
         return;
      }

      let { body } = req;
      const mailerDetails = await mailerService.findOne({ refid: '1' })
      const orderDetails = await orderService.getOrderDetails({ orderNo: body.order })
      const productDetails = await productService.getProductDetails({ slug: body.product })
      const returnedProduct = orderDetails.products.map(product => {
         if (product.productId.slug == body.product) {
            return product
         }
      })

      body.returnAmount = (Number(returnedProduct[0]['pricePerUnit']) * (body.quantity ? Number(body.quantity) : 1)).toFixed(2)
      body.order = orderDetails?._id
      body.product = productDetails?._id

      const reference = async () => {
         const returnRef = generateReference()
         const returnDetails = await service.findOne({ reference: returnRef })
         if (returnDetails) {
            reference()
         } else {
            body.reference = returnRef
         }
      }
      await reference()

      body.refid = await service.count({}) + 1
      const response = await service.create(body)
      if (response instanceof Error) {
         helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
         });
      } else {
         helper.deliverResponse(res, 200, response, {
            "error_code": messages.RETURN_REQUEST_PLACED.error_code,
            "error_message": messages.RETURN_REQUEST_PLACED.error_message
         });
      }
   } catch (error) {
      console.log('Error caught in create return request API :: ' + error)
      helper.deliverResponse(res, 422, {}, {
         "error_code": messages.serverError.error_code,
         "error_message": messages.serverError.error_message
      });
   }
}

exports.returns = async (req, res) => {
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
      const response = await service.search({},
         { _id: 0, __v: 0, updatedAt: 0 }, { createdAt: -1 }, body.page, body.limit)
      helper.deliverResponse(res, 200, response, {
         "error_code": messages.successResponse.error_code,
         "error_message": messages.successResponse.error_message
      });
   } catch (error) {
      console.log('Error caught in search return request API :: ' + error)
      helper.deliverResponse(res, 422, {}, {
         "error_code": messages.serverError.error_code,
         "error_message": messages.serverError.error_message
      });
   }
}

exports.returnDetails = async (req, res) => {
   try {
      const settings = await settingsService.findOne({ })
      const { reference } = req.params
      let images = []
      const returnDetails = await service.findOne({ reference: reference })
      const customerDetails = await userService.getCustomer({ _id: returnDetails.order.customerId })
      if (returnDetails.images.length > 0) {
         images = returnDetails.images.map(image => {
            return `${BASE_URL}${image}`
         })
      }
      helper.deliverResponse(res, 200, {
         reference: returnDetails.reference,
         order: returnDetails.order,
         customer: customerDetails,
         product: returnDetails.product,
         quantity: returnDetails.quantity,
         reason: returnDetails.reason,
         returnAmount: `${settings?.currency} ${returnDetails.returnAmount}`,
         isRefunded: returnDetails.isRefunded,
         images: images,
         isRejected: returnDetails.isRejected,
         isAccepted: returnDetails.isAccepted,
         comments: returnDetails.comments,
         createdAt: `${months[new Date(returnDetails.createdAt).getMonth()]} ${new Date(returnDetails.createdAt).getDate()} ${new Date(returnDetails.createdAt).getFullYear()}`,
      }, {
         "error_code": messages.successResponse.error_code,
         "error_message": messages.successResponse.error_message
      });
   } catch (error) {
      console.log('Error caught in search return request API :: ' + error)
      helper.deliverResponse(res, 422, {}, {
         "error_code": messages.serverError.error_code,
         "error_message": messages.serverError.error_message
      });
   }
}

exports.update = async (req, res) => {
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
      const response = await service.update({ reference: body.reference }, body)
      if (response instanceof Error) {
         helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
         });
      } else {
         activity.logActivity(res?.locals?.user?.email, `Return ${body.reference} details updated`)
         helper.deliverResponse(res, 200, {}, {
            "error_code": messages.RETURN_REQUEST_UPDATED.error_code,
            "error_message": messages.RETURN_REQUEST_UPDATED.error_message
         });
      }
   } catch (error) {
      console.log('Error caught in update return request API :: ' + error)
      helper.deliverResponse(res, 422, {}, {
         "error_code": messages.serverError.error_code,
         "error_message": messages.serverError.error_message
      });
   }
}