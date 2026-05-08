const { messages } = require("../../../../config/constants")
const { deliverResponse } = require("../../../../util/responseHelper")
const { Log } = require("../../../db")

exports.find = async (req, res) => {
    const limit = 80
    const page = req.body.page || 1
    let query = { 'metadata.importId': req.params.importId }
    if (req.body.keyword) {
        query['message'] = { $regex: req.body.keyword, $options: 'i' }
    }

    try {
        const [
            isLastPage,
            response
        ] = await Promise.all([
            Log
                .find(query)
                .countDocuments()
                .then((count) => {
                    return (limit * page) > count ? true : false
                }),
            Log
                .find(query)
                .limit(limit * 1)
                .skip((page - 1) * limit)
        ])
        return deliverResponse(res, 200, { response, isLastPage }, messages.successResponse)
    } catch (error) {
        console.error('Error caught in find logs API :: ' + error)
        return deliverResponse(res, 422, error, messages.serverError)
    }

}