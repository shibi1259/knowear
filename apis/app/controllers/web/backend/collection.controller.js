const helper = require("../../../../util/responseHelper");
const messages = require("../../../../config/constants").messages;
const service = require("../../../services/collection.service");
const slug = require("../../../../util/slug");
const db = require("../../../db");
const productService = require("../../../services/product.service")

exports.createBySKUs = async (req, res, next) => {
    try {
        const { body } = req;
        let products = []
        body.slug = await slug.createSlug(db.Collection, body.name, { slug: await slug.generateSlug(body.name) });
        for (let product of body?.products) {
            const productDetails = await productService.getSingleProduct({ sku: product, isActive: true, isDelete: false })
            if (productDetails) products.push(productDetails?._id)
        }
        body.products = products
        const response = await service.create(body)
        if (response instanceof Error) {
            helper.deliverResponse(res, 422, response, {
                error_code: messages.serverError.error_code,
                error_message: messages.serverError.error_message,
            });
        } else {
            helper.deliverResponse(res, 200, collection, {
                error_code: messages.COLLECTION_SUCCESS.error_code,
                error_message: messages.COLLECTION_SUCCESS.error_message,
            })
        }
    } catch (error) {
        console.log("Error caught in create collection api :: " + error);
        helper.deliverResponse(res, 422, {}, {
            error_code: messages.serverError.error_code,
            error_message: messages.serverError.error_message,
        });
    }
}

exports.create = async (req, res) => {
    try {
        const { body } = req;
        body.slug = await slug.createSlug(db.Collection, body.name, { slug: await slug.generateSlug(body.name) });
        let response = await service.create(body);
        if (response instanceof Error) {
            helper.deliverResponse(res, 422, response, messages.serverError);
        } else {
            helper.deliverResponse(res, 200, response, messages.successResponse)
        }
    } catch (error) {
        console.log("Error caught in create collection api :: " + error);
        helper.deliverResponse(res, 422, error, messages.serverError);
    }
};

exports.find = async (req, res) => {
    try {
        let query = { isDelete: false }
        if (req.query.status == 'active') query['isActive'] = true
        let response = await service.find(query);
        helper.deliverResponse(res, 200, response, {
            error_code: messages.serverError.error_code,
            error_message: messages.serverError.error_message,
        });
    } catch (error) {
        helper.deliverResponse(res, 422, {}, {
            error_code: messages.serverError.error_code,
            error_message: messages.serverError.error_message,
        });
    }
};

exports.findOne = async (req, res) => {
    try {
        let response = await service.findOne({ _id: req.params.id, });
        helper.deliverResponse(res, 200, response, messages.successResponse);
    } catch (error) {
        helper.deliverResponse(res, 422, {}, messages.serverError);
    }
};

exports.search = async (req, res, next) => {
    try {
        const { body } = req
        let query = { isDelete: false }
        if (body?.keyword) query['name'] = { $regex: body?.keyword, $options: 'i' }
        if (body?.isActive) query['isActive'] = body?.isActive
        if (body?.isFeatured) query['isFeatured'] = body?.isFeatured
        if (body?.isArchive) query['isArchive'] = body?.isArchive
        const collections = await service.search(query, body?.page, body?.limit, {})
        helper.deliverResponse(res, 200, collections, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        });
    } catch (_err) {
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.update = async (req, res, next) => {
    try {
        const { body } = req;
        let products = []
        const collectionDetails = await service.findOne({ _id: body?._id })

        if (body.name) {
            if (body.name != collectionDetails.name)
                body.slug = await slug.createSlug(db.Collection, body?.name, { slug: await slug.generateSlug(body?.name) })
        }

        if (body?.isSku == true) {
            for (let product of body?.products) {
                const productDetails = await productService.getSingleProduct({ sku: product, isActive: true, isDelete: false })
                if (productDetails) products.push(productDetails?._id)
            }
            let newProducts = []
            for (let _product of collectionDetails?.products) newProducts.push(String(_product?._id))
            for (let product of products) {
                if (!newProducts.includes(String(product))) newProducts.push(String(product))
            }
            body.products = newProducts
        }

        let response = await service.update({ _id: body?._id }, body);
        if (response instanceof Error) {
            helper.deliverResponse(res, 422, response, {
                error_code: messages.serverError.error_code,
                error_message: messages.serverError.error_message,
            });
        } else {
            helper.deliverResponse(res, 200, response, {
                error_code: messages.COLLECTION_UPDATE.error_code,
                error_message: messages.COLLECTION_UPDATE.error_message,
            });
        }
    } catch (error) {
        console.log("Error caught while updating collection :: " + error)
        helper.deliverResponse(res, 422, error, {
            error_code: messages.serverError.error_code,
            error_message: messages.serverError.error_message,
        });
    }
};

exports.getActiveCollection = async (req, res) => {
    try {
        let activeCollections = await db.Collection.find({ isDelete: false, isActive: true });
        helper.deliverResponse(res, 200, activeCollections, {
            error_code: messages.successResponse.error_code,
            error_message: messages.successResponse.error_message,
        });
    } catch (error) {
        console.log("Error caught in active collections api :: " + error)
        helper.deliverResponse(res, 422, {}, {
            error_code: messages.serverError.error_code,
            error_message: messages.serverError.error_message,
        });
    }
};

exports.manageCollection = async (req, res) => {
    try {
        const { body } = req

        const collectionExists = await service.getCollection({ isDelete: false, isActive: true })

        if (collectionExists) {
            const response = await service.updateCollection({ _id: collectionExists._id }, body)
            helper.deliverResponse(res, 200, response, {
                "error_code": messages.successResponse.error_code,
                "error_message": messages.successResponse.error_message
            });
        } else {
            const response = await service.createCollection(body);
            helper.deliverResponse(res, 200, response, {
                "error_code": messages.successResponse.error_code,
                "error_message": messages.successResponse.error_message
            });
        }
    } catch (error) {
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.getCollectionPage = async (req, res) => {
    try {
      const collection = await service.getCollection({ isDelete: false, isActive: true })
      helper.deliverResponse(res, 200, collection, {
        "error_code": messages.successResponse.error_code,
        "error_message": messages.successResponse.error_message
      });
    } catch (error) {
      helper.deliverResponse(res, 422, {}, {
        "error_code": messages.serverError.error_code,
        "error_message": messages.serverError.error_message
      });
    }
  }
  

