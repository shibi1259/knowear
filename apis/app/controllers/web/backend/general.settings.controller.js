const service = require("../../../services/general.settings.service")
const helper = require('../../../../util/responseHelper')
const messages = require('../../../../config/constants').messages

exports.manage = async (req, res) => {
   try {
      const settings = await service.findOne({})
      if (settings) {
         const response = await service.update({ _id: settings?._id }, req.body)
         if (response instanceof Error) {
            helper.deliverResponse(res, 422, response, {
               "error_code": messages.serverError.error_code,
               "error_message": messages.serverError.error_message
            });
         } else {
            helper.deliverResponse(res, 200, response, {
               "error_code": messages.SETTINGS_UPDATED.error_code,
               "error_message": messages.SETTINGS_UPDATED.error_message
            });
         }
      } else {
         const response = await service.create(req.body)
         if (response instanceof Error) {
            helper.deliverResponse(res, 422, response, {
               "error_code": messages.serverError.error_code,
               "error_message": messages.serverError.error_message
            });
         } else {
            helper.deliverResponse(res, 200, response, {
               "error_code": messages.SETTINGS_UPDATED.error_code,
               "error_message": messages.SETTINGS_UPDATED.error_message
            });
         }
      }
   } catch (error) {
      console.log("Error caught in manage settings API :: ", error);
      helper.deliverResponse(res, 422, {}, {
         "error_code": messages.serverError.error_code,
         "error_message": messages.serverError.error_message
      });
   }
}

exports.findOne = async (req, res) => {
   try {
      let response = await service.findOne({})
      response = { ...response?._doc, baseS3Url: process.env.BASE_URL }
      helper.deliverResponse(res, 200, response, {
         "error_code": messages.successResponse.error_code,
         "error_message": messages.successResponse.error_message
      })
   } catch (error) {
      helper.deliverResponse(res, 200, {}, {
         "error_code": messages.serverError.error_code,
         "error_message": messages.serverError.error_message
      });
   }
}