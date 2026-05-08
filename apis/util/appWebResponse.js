const constants = require('../config/constants')
const MESSAGES = constants.messages;

exports.deliverResponse = (res, httpStatus = 200, data, msg, toast = false, meta = {}) => {
   if (httpStatus === 200) {
      const response = {
         Success: true,
         ErrorCode: MESSAGES.successResponse.error_code,
         Message: MESSAGES.successResponse.error_message,
         Toast: toast
      };
      if (msg) {
         response.ErrorCode = msg.error_code
         response.Message = msg.error_message
      }
      if (data) { response.Data = data }
      response.Meta = meta;
      res.status(httpStatus).json(response)
   } else {
      const errorResponse = {
         Success: false,
         ErrorCode: MESSAGES.serverError.error_code,
         message: MESSAGES.serverError.error_message
      };
      errorResponse.Data = data;
      if (msg) {
         errorResponse.ErrorCode = msg.error_message;
         errorResponse.Message = msg.error_message;
      }
      errorResponse.Meta = meta;
      res.status(httpStatus).json(errorResponse)
   }
}
