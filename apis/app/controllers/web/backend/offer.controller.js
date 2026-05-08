const helper = require("../../../../util/responseHelper");
const { body, validationResult } = require("express-validator");
const messages = require("../../../../config/constants").messages;
const service = require("../../../services/offer.service");
const slug = require("../../../../util/slug");
const db = require("../../../db");
const offerEngine = require("../../../../util/offerEngine");
const adminService = require("../../../services/auth.service");
const { logActivity } = require("../../../../util/activity.creator");

const getAdminDetails = async (email) => {
    const details = await adminService.adminDetails({ email: email, isActive: true, isDelete: false });
    return details;
};

exports.create = async (req, res) => {
    try {
        let { body } = req;
        let { email } = res?.locals?.user;
        const adminDetails = await getAdminDetails(email);

        body.slug = await slug.createSlug(
            db.Offer,
            body.title,
            { slug: await slug.generateSlug(body.title) }
        );
        body.createdBy = adminDetails?._id;

        let response = await service.create(body);
        if (response instanceof Error) {
            return helper.deliverResponse(res, 422, response, messages.serverError);
        }

        let sourceIds = [];
        let bulkFilter = { isDelete: false };
        if (body.offerCategory === "complete") {
            const allProducts = await db.Product.find({ isDelete: false }, "_id");
            sourceIds = allProducts.map(p => p._id.toString());
        } else if (body.offerCategory == "partial") {
            if (body.categories && body.categories.length > 0) {
                const products = await db.Product.find({ 
                    category: { $in: body.categories }, 
                    isDelete: false 
                }).lean();
                sourceIds = products.map(product => product._id);
            } else if (body.collections && body.collections.length > 0) {
                for (const collectionId of body.collections) {
                    const collectionDetails = await db.Collection.findOne({ 
                        _id: collectionId 
                    }).lean();
                    if (collectionDetails?.products) {
                        sourceIds.push(...collectionDetails.products);
                    }
                }
            } else if (body.products && body.products.length > 0) {
                sourceIds = body.products;
            }

            bulkFilter = { _id: { $in: sourceIds }, isDelete: false };
        }
        console.log("sourceIds", sourceIds);
        
        const products = await db.Product.find(bulkFilter).lean();

        const bulkOperations = products.map((product) => ({
          updateOne: {
            filter: { _id: product._id },
            update: {
              $addToSet: { offers: response },
              $set: {
                "price.selling": calculateOfferPrice(product, body),
                offerExists: true,
              },
            },
          },
        }));

        const productsResponse = await db.Product.bulkWrite(bulkOperations);

        logActivity(email, `${body.title} offer created`);
        return helper.deliverResponse(res, 200, {
            response,
            productsResponse
        }, messages.OFFER_SUCCESS);
    } catch (error) {
        console.error(`Error caught in create offer ${error}`);
        return helper.deliverResponse(res, 422, error, messages.serverError);
    }
};

const calculateOfferPrice = (product, offer) => {
    const basePrice = product.price.offer;
    let discountAmount = 0;

    if (offer.offerType === 'percentage') {
        discountAmount = (basePrice * parseFloat(offer.offerAmount)) / 100;
    } else if (offer.offerType === 'fixed') {
        discountAmount = parseFloat(offer.offerAmount);
    }

    const newSellingPrice = Math.max(0, basePrice - discountAmount);
        
    return newSellingPrice;
};

exports.find = async (req, res) => {
    try {
        const response = await service.find({ isDelete: false });
        return helper.deliverResponse(res, 200, response, messages.successResponse);
    } catch (error) {
        return helper.deliverResponse(res, 422, {}, messages.serverError);
    }
};

exports.search = async (req, res, next) => {
    try {
        const { body } = req;
        let query = { isDelete: false };

        if (body.name) query["title"] = { $regex: body.name, $options: "i" };
        if (body.isActive) query["isActive"] = body.isActive;
        if (body.fromDate) query["startDate"] = { $gte: new Date(body.fromDate).toISOString() };
        if (body.lastDate) query["endDate"] = { $lte: new Date(body.lastDate).toISOString() };
        // if (body.fromDate && body?.lastDate) query['$and'] = [
        //     { startDate: { $gte: new Date(body?.fromDate).toISOString() } },
        //     { endDate: { $lte: new Date(body?.lastDate).toISOString() } }
        // ]
        if (body?.fromDate && body?.lastDate) {
            const fromDate = new Date(body.fromDate);
            const toDate = new Date(body.lastDate);
            query["$and"] = [
                { startDate: { $gte: fromDate } }, // Coupons ending on or after the given fromDate
                { endDate: { $lte: toDate } }, // Coupons starting on or before the given toDate
            ];
        } else {
            if (body?.fromDate) {
                const fromDate = new Date(body.fromDate);
                query["endDate"] = { $gte: fromDate };
            }
            if (body?.lastDate) {
                const toDate = new Date(body.lastDate);
                query["startDate"] = { $lte: toDate };
            }
        }

        const response = await service.search(query, body?.page, body?.limit);
        return helper.deliverResponse(res, 200, response, messages.successResponse);
    } catch (_err) {
        return helper.deliverResponse(res, 422, {}, messages.serverError);
    }
};

exports.findOne = async (req, res) => {
    try {
        const { offer } = req.params;
        const response = await service.findOne({ slug: offer, isDelete: false });
        return helper.deliverResponse(res, 200, response, messages.successResponse);
    } catch (error) {
        return helper.deliverResponse(res, 200, {}, messages.serverError);
    }
};

exports.update = async (req, res, next) => {
    try {
        const { body } = req;
        const offerDetails = await service.findOne({ slug: body.slug });

        if (!offerDetails) {
            return helper.deliverResponse(res, 404, null, messages.OFFER_NOT_FOUND);
        }

        if (body?.title && offerDetails?.title !== body?.title) {
            body.slug = await slug.createSlug(
                db.Offer,
                body.title,
                { slug: await slug.generateSlug(body.title) }
            );
        }

        // If offerCategory not in payload, use existing offer details (toggle-only update)
        if (!body.offerCategory) {
            body.offerCategory = offerDetails.offerCategory;
            body.products = offerDetails.products;
            body.collections = offerDetails.collections;
            body.categories = offerDetails.categories;
            body.offerType = offerDetails.offerType;
            body.offerAmount = offerDetails.offerAmount;
        }

        let newProductIds = [];
        if (body.offerCategory === "complete") {
            const allProducts = await db.Product.find({ isDelete: false }, "_id");
            newProductIds = allProducts.map(p => p._id.toString());
        } else if (body.offerCategory === "partial") {
            if (body.categories?.length > 0) {
                const products = await db.Product.find(
                    {
                        category: { $in: body.categories },
                        isDelete: false
                    },
                    "_id"
                );
                newProductIds.push(...products.map(p => p._id.toString()));
            }
            if (body.collections?.length > 0) {
                const collections = await db.Collection.find(
                    {
                        _id: { $in: body.collections }
                    },
                    "products"
                );
                collections.forEach(col => {
                    if (col.products?.length > 0) {
                        newProductIds.push(...col.products.map(id => id.toString()));
                    }
                });
            }
            if (body.products?.length > 0) {
                newProductIds.push(...body.products.map(id => id.toString()));
            }
        }

    
newProductIds = [...new Set(newProductIds)];
        if (!body.offerCategory) {
            // Toggle-only update: preserve existing products
            body.products = (offerDetails.products || []).map(id => id.toString());
            newProductIds = body.products;
        } else {
            body.products = newProductIds;
        }
        console.log("newProductIds",newProductIds);        

        let response = await service.update({ slug: offerDetails.slug }, body);
        if (response instanceof Error) {
            return helper.deliverResponse(res, 422, response, messages.serverError);
        }

        const oldProductIds = (offerDetails.products || []).map(id => id.toString());
        
if (body.isActive === false) {
            // Offer disabled — reset ALL product prices and remove offer
            const allProductIds = (offerDetails.products || []).map(id => id.toString());
            if (allProductIds.length > 0) {
                const productsToResetDetails = await db.Product.find({
                    _id: { $in: allProductIds },
                    isDelete: false
                }).lean();
                const resetOperations = productsToResetDetails.map(product => ({
                    updateOne: {
                        filter: { _id: product._id },
                        update: {
                            $set: { "price.selling": product.price.offer, offerExist: false }
                        }
                    }
                }));
                await db.Product.bulkWrite(resetOperations);
            }
        } else {
            // Offer enabled — apply discount to all relevant products
            const productsToUpdate = newProductIds;
            const productsToReset = oldProductIds.filter(id => !newProductIds.includes(id));
            if (productsToUpdate.length > 0) {
                const products = await db.Product.find({
                    _id: { $in: productsToUpdate },
                    isDelete: false
                }).lean();
                const updateOperations = products.map((product) => ({
                    updateOne: {
                        filter: { _id: product._id },
                        update: {
                            $set: {
                                "offers.$[offer]": response,
                                "price.selling": calculateOfferPrice(product, body),
                                ...(body.isDelete ? {} : { offerExist: true }),
                            },
                        },
                        arrayFilters: [{ "offer._id": offerDetails._id }],
                    },
                }));
                await db.Product.bulkWrite(updateOperations);
            }
            if (productsToReset.length > 0) {
                const productsToResetDetails = await db.Product.find({
                    _id: { $in: productsToReset },
                    isDelete: false
                }).lean();
                const resetOperations = productsToResetDetails.map(product => ({
                    updateOne: {
                        filter: { _id: product._id },
                        update: {
                            $pull: { offers: { _id: offerDetails._id } },
                            $set: { "price.selling": product.price.offer }
                        }
                    }
                }));
                await db.Product.bulkWrite(resetOperations);
            }
        }

        logActivity(res?.locals?.user?.email, `${body.title || offerDetails.title} offer updated`);
        return helper.deliverResponse(res, 200, response, messages.OFFER_UPDATE);
    } catch (error) {
        console.error("Error caught in update offer API :: " + error);
        return helper.deliverResponse(res, 422, {}, messages.serverError);
    }
};
