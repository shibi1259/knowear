const { messages } = require("../../../../config/constants");
const helper = require("../../../../util/responseHelper");
const service = require("../../../services/product.enquiry.service");

exports.find = async (req, res) => {
    try {
        let query = {};
        if(req.query?.status == "Enquired"){
            query = { status: "Enquired" }
        }else if (req.query?.status == "Responded"){
            query = { status: "Responded" }
        }
        if(req.query?.keyword) query['$or'] = [
            { name: { $regex: req.query.keyword, $options: 'i' } }, 
            { email: { $regex: req.query.keyword, $options: 'i' } }, 
            { mobile: { $regex: req.query.keyword, $options: 'i' } }
        ]
        const response = await service.search(query, req.query.page, 20, {}, { createdAt: -1 });
        helper.deliverResponse(res, 200, response, {
            error_code: messages.PRODUCT_ENQUIRY_LIST.error_code,
            error_message: messages.PRODUCT_ENQUIRY_LIST.error_message,
        });
    } catch (error) {
        console.log("Error caught in list API :: " + error);
        helper.deliverResponse(res, 422, {}, {
            error_code: messages.serverError.error_code,
            error_message: messages.serverError.error_message,
        });
    }
}

exports.findOne = async (req, res) => {
    try {
        const response = await service.findOne({ _id: req.params.enquiryId })
        helper.deliverResponse(res, 200, response, {
            error_code: messages.PRODUCT_ENQUIRY_LIST.error_code,
            error_message: messages.PRODUCT_ENQUIRY_LIST.error_message,
        });
    } catch (error) {
        console.log("Error caught in list API :: " + error);
        helper.deliverResponse(res, 422, {}, {
            error_code: messages.serverError.error_code,
            error_message: messages.serverError.error_message,
        });
    }
}

exports.update = async (req, res) => {
    try {
        const response = await service.update({_id: req.params.enquiryId}, req.body)
        if(response instanceof Error){
            helper.deliverResponse(res, 422, {}, {
                error_code: messages.serverError.error_code,
                error_message: messages.serverError.error_message
            })
        }else{
            helper.deliverResponse(res, 200, response, {
                error_code: messages.successResponse.error_code,
                error_message: messages.successResponse.error_message,
            });
        }
    } catch (error) {
        console.log("Error caught in update product enquiry API :: " + error);
        helper.deliverResponse(res, 422, {}, {
            error_code: messages.serverError.error_code,
            error_message: messages.serverError.error_message,
        });
    }
}