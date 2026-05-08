const constants = require('../config/constants')
const MESSAGES = constants.messages;

exports.deliverResponse = (res, httpStatus = 200, data, msg, meta = {}) => {
    if (httpStatus === 200) {
        const response = {
            success: true,
            errorCode: MESSAGES.successResponse.error_code,
            message: MESSAGES.successResponse.error_message
        };
        if (data) {
            response.result = data;
        }
        if (msg) {
            response.errorCode = msg.error_code;
            response.message = msg.error_message;
        }
        response.meta = meta;
        res.status(httpStatus).json(response)
    } else {
        const errorResponse = {
            success: false,
            result: {},
            errorCode: MESSAGES.serverError.error_code,
            message: MESSAGES.serverError.error_message
        };
        errorResponse.result = data;
        if (msg) {
            errorResponse.errorCode = msg.error_code;
            errorResponse.message = msg.error_message;
        }
        errorResponse.meta = meta;
        res.status(httpStatus).json(errorResponse)
    }
}
