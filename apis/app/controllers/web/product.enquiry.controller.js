const helper = require('../../../util/responseHelper')
const messages = require('../../../config/constants').messages
const service = require('../../services/product.enquiry.service')

exports.submitProductEnquiry = async (req, res) => {
    try{
      const response = await service.create(req.body)
      if(response instanceof Error){
        helper.deliverResponse(res, 422, {}, {
          "error_code": messages.serverError.error_code,
          "error_message": messages.serverError.error_message
        })
      }else{
        helper.deliverResponse(res, 200, response, {
          "error_code": messages.PRODUCT_ENQUIRY_SUBMITTED.error_code,
          "error_message": messages.PRODUCT_ENQUIRY_SUBMITTED.error_message
        })
      }
    }catch(error){
      console.log("Error caught in submitProductEnquiry API :: " + error);
      helper.deliverResponse(res, 422, {}, {
        "error_code": messages.serverError.error_code,
        "error_message": messages.serverError.error_message
      })
    }
  }