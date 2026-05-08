const helper = require('../../../util/responseHelper')
const messages = require('../../../config/constants').messages
const service = require('../../services/collection.service')

exports.getCollections = async (req, res, next) => {
   try {
      const { body } = req
      const query = { isActive: true, isDelete: false }
      const response = await service.search(query, body?.page, body?.limit)
      helper.deliverResponse(res, 200, response, {
         "error_code": messages.successResponse.error_code,
         "error_message": messages.successResponse.error_message
      });
   } catch {
      helper.deliverResponse(res, 422, {}, {
         "error_code": messages.serverError.error_code,
         "error_message": messages.serverError.error_message
      });
   }
}

exports.getCollectionBySlug = async (req, res, next) => {
   try {
      const { body } = req
      const collection = await service.getCollectionBySlug(body?.slug)
      if (!collection) {
         return helper.deliverResponse(res, 404, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
         });
      }
      helper.deliverResponse(res, 200, collection, {
         "error_code": messages.successResponse.error_code,
         "error_message": messages.successResponse.error_message
      });
   } catch (error) {
      console.log("error caught in getCollectionBySlug controller: " + error)
      helper.deliverResponse(res, 422, {}, {
         "error_code": messages.serverError.error_code,
         "error_message": messages.serverError.error_message
      });
   }
}