const helper = require("../../../../util/responseHelper");
const { messages } = require("../../../../config/constants");
const service = require("../../../services/file.import.service");
const { months } = require("../../../../util/months");
const { FileImport } = require("../../../db");

exports.getFileImports = async (req, res) => {
    try {
        const { body } = req
        let query = {}
        if (body?.status) query['status'] = body.status
        if (body.date) query['$and'] = [
            { createdAt: { $gte: new Date(new Date(body.date).setHours(0, 0, 0, 0)).toISOString() } },
            { createdAt: { $lte: new Date(new Date(body.date).setHours(23, 59, 59, 59)).toISOString() } }
        ]
        const response = await service.search(query, {}, { createdAt: -1 }, body.page, body.limit)
        let imports = []
        for (let item of response?.data) {
            imports.push({
                title: item.title,
                createdAt: months[new Date(item.createdAt).getMonth()] + " " + new Date(item.createdAt).getDate() + " " + new Date(item.createdAt).getFullYear(),
                status: item.status,
                executionTime: item.executionTime,
                createdBy: item.createdBy?.email,
                type: item.type,
                _id: item._id
            })
        }
        return helper.deliverResponse(res, 200, {
            data: imports,
            totalResults: response?.totalResults,
            page: response?.page,
            totalPages: response?.totalPages,
            limit: response?.limit,
            isLastPage: response?.isLastPage,
        }, messages.successResponse)
    } catch (error) {
        console.log("Error caught in get file imports api :: " + error)
        return helper.deliverResponse(res, 422, {}, messages.serverError);
    }
}

exports.findOne = async (req, res) => {
    const response = await FileImport.findOne({ _id: req.params.importId }).populate('createdBy')
    return helper.deliverResponse(res, 200, response, messages.successResponse)
}