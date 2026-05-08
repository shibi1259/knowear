const helper = require('../../../../util/responseHelper')
const messages = require('../../../../config/constants').messages
const service = require('../../../services/page.limits.service')

exports.add = async (req, res) => {
   try {
      let { body } = req;
      body.slug = "page-limits"
      let pagelimit = await service.createPageLimit(body);
      helper.deliverResponse(res, 200, pagelimit);
   } catch (error) {
      helper.deliverResponse(res, 200, {}, {
         "error_code": messages.serverError.error_code,
         "error_message": messages.serverError.error_message
      });
   }
}

exports.getPageLimits = async (req, res) => {
   try {
      let pagelimit = await service.getPageLimit({ isActive: true, isDelete: false });
      helper.deliverResponse(res, 200, pagelimit);
   } catch (error) {
      helper.deliverResponse(res, 200, {}, {
         "error_code": messages.serverError.error_code,
         "error_message": messages.serverError.error_message
      });
   }
}

exports.getPageLimitById = async (req, res) => {
   try {
      let { id } = req.query;
      let pagelimit = await service.getPageLimitById(id);
      helper.deliverResponse(res, 200, pagelimit);
   } catch (error) {
      helper.deliverResponse(res, 200, {}, {
         "error_code": messages.serverError.error_code,
         "error_message": messages.serverError.error_message
      });
   }
}

exports.getPageLimitCount = async (req, res) => {
   try {
      let pagelimit = await service.getPageLimitCount({ isActive: true, isDelete: false });
      helper.deliverResponse(res, 200, pagelimit);
   } catch (error) {
      helper.deliverResponse(res, 200, {}, {
         "error_code": messages.serverError.error_code,
         "error_message": messages.serverError.error_message
      });
   }
}

exports.update = async (req, res) => {
   try {
      let { id } = req.query;
      let { body } = req;
      let pagelimit = await service.updateLimit(id, body);
      helper.deliverResponse(res, 200, pagelimit);
   } catch (error) {
      helper.deliverResponse(res, 200, {}, {
         "error_code": messages.serverError.error_code,
         "error_message": messages.serverError.error_message
      });
   }
}