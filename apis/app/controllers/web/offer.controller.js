const helper = require('../../../util/responseHelper')
const messages = require('../../../config/constants').messages
const service = require('../../services/offer.service')

exports.getOffers = async (req, res, next) => {
   try {
      const { page, limit } = req.query
      const query = { isActive: true, isDelete: false }
      const offer = await service.getOffersByPage(query, page, limit)
      helper.deliverResponse(res, 200, offer);
   } catch {
      helper.deliverResponse(res, 422, {}, {
         "error_code": messages.serverError.error_code,
         "error_message": messages.serverError.error_message
      });
   }
}