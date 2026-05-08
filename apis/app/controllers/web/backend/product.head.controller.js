const helper = require("../../../../util/responseHelper");
const { body, validationResult } = require("express-validator");
const constants = require("../../../../config/constants");
const { messages } = constants;
const service = require("../../../services/product.head.service");
const brandService = require("../../../services/brand.service")
const slug = require("../../../../util/slug");
const db = require("../../../db");

exports.validate = (method) => {
   switch (method) {
      case "create": {
         return [
            body("name", `name is required`).exists(),
         ];
      }
      case "update": {
         return [
            body("name", `name is required`).exists(),
         ];
      }
   }
};

exports.add = async (req, res) => {
   try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
         helper.deliverResponse(res, 422, errors, {
            error_code: messages.VALIDATION_ERROR.error_code,
            error_message: messages.VALIDATION_ERROR.error_message,
         });
         return;
      }

      const { body } = req
      body.slug = await slug.createSlug(db.ProductHead, body.name, { slug: await slug.generateSlug(body.name) });
      body.prodid = await service.count({}) + 1
      const productDetails = await service.findOne({ sku: body?.sku })
      if (!productDetails) {
         const producthead = await service.add(body)
         helper.deliverResponse(res, 200, producthead, {
            error_code: messages.PRODUCT_HEAD_ADD.error_code,
            error_message: messages.PRODUCT_HEAD_ADD.error_message,
         });
      } else {
         helper.deliverResponse(res, 200, {}, {
            error_code: messages.DUPLICATE_SKU.error_code,
            error_message: messages.DUPLICATE_SKU.error_message,
         });
      }
   } catch (error) {
      console.error("Error caught while adding product head :: " + error);
      helper.deliverResponse(res, 200, {}, {
         error_code: messages.serverError.error_code,
         error_message: messages.serverError.error_message,
      });
   }
}

exports.getAllProductHead = async (req, res) => {
   try {
      const query = { isDelete: false, isArchive: false }
      const producthead = await service.find(query)
      helper.deliverResponse(res, 200, producthead, {
         error_code: messages.successResponse.error_code,
         error_message: messages.successResponse.error_message,
      });
   } catch (error) {
      console.error("Error caught while adding product head :: " + error);
      helper.deliverResponse(res, 200, {}, {
         error_code: messages.serverError.error_code,
         error_message: messages.serverError.error_message,
      });
   }
}

exports.productDetails = async (req, res) => {
   try {
      const { product } = req.params
      const productDetails = await service.find({ prodid: product, isDelete: false })
      helper.deliverResponse(res, 200, productDetails, {
         error_code: messages.successResponse.error_code,
         error_message: messages.successResponse.error_message,
      });
   } catch (error) {
      console.error("Error caught in product head details API :: " + error);
      helper.deliverResponse(res, 422, {}, {
         error_code: messages.serverError.error_code,
         error_message: messages.serverError.error_message,
      });
   }
}

exports.getDetails = async (req, res) => {
   try {
      const response = await service.findOne({ _id: req.params.productId })
      helper.deliverResponse(res, 200, response, messages.successResponse);
   } catch (error) {
      console.error("Error caught in product head details API :: " + error);
      helper.deliverResponse(res, 422, {}, messages.serverError);
   }
}

exports.getParentDetails = async (req, res) => {
   try {
      const { product } = req.params
      const details = await service.findOne({ slug: product })
      helper.deliverResponse(res, 200, details, {
         error_code: messages.successResponse.error_code,
         error_message: messages.successResponse.error_message,
      });
   } catch (error) {
      console.error("Error caught in product head details API :: " + error);
      helper.deliverResponse(res, 422, {}, {
         error_code: messages.serverError.error_code,
         error_message: messages.serverError.error_message,
      });
   }
}

exports.searchProductHeads = async (req, res) => {
   try {
      const { body } = req
      let query = {}
      if (body?.name) {
         query['name'] = { $regex: body['name'], $options: 'i' }
      }

      const products = await service.search(query, body?.page, body?.limit)
      helper.deliverResponse(res, 200, products, {
         error_code: messages.successResponse.error_code,
         error_message: messages.successResponse.error_message,
      });
   } catch (error) {
      console.error("Error caught while searching product head :: " + error);
      helper.deliverResponse(res, 200, {}, {
         error_code: messages.serverError.error_code,
         error_message: messages.serverError.error_message,
      });
   }
}

exports.update = async (req, res) => {
   try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
         helper.deliverResponse(res, 422, errors, {
            error_code: messages.VALIDATION_ERROR.error_code,
            error_message: messages.VALIDATION_ERROR.error_message,
         });
         return;
      }

      const { body } = req
      const productDetails = await service.findOne({ _id: body._id })
      if (body.name == productDetails.name) {
         body.slug = productDetails?.slug
      } else {
         body.slug = await slug.createSlug(db.ProductHead, body?.name, { slug: await slug.generateSlug(body?.name) })
      }
      const duplicateSku = await service.findOne({ sku: body?.sku, _id: { $nin: productDetails['_id'] } })
      if (duplicateSku) {
         helper.deliverResponse(res, 422, {}, messages.DUPLICATE_SKU);
      } else {
         const updatedDetails = await service.update({ _id: body._id }, body)
         if (updatedDetails instanceof Error) {
            helper.deliverResponse(res, 422, {}, messages.serverError);
         } else {
            helper.deliverResponse(res, 200, updatedDetails, messages.PRODUCT_UPDATE);
         }
      }
   } catch (error) {
      console.error("Error caught in product head API :: " + error);
      helper.deliverResponse(res, 422, {}, messages.serverError);
   }
}


exports.getChildProducts = async (req, res) => {
   try {
      const { product } = req.params
      const details = await prod.getChildProducts(product)
      helper.deliverResponse(res, 200, details, {
         error_code: messages.successResponse.error_code,
         error_message: messages.successResponse.error_message,
      });
   } catch (error) {
      console.error("Error caught in product head details API :: " + error);
      helper.deliverResponse(res, 422, error, {
         error_code: messages.serverError.error_code,
         error_message: messages.serverError.error_message,
      });
   }
}