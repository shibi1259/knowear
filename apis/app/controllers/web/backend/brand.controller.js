const helper = require('../../../../util/responseHelper')
const { body, validationResult } = require('express-validator')
const messages = require('../../../../config/constants').messages
const service = require('../../../services/brand.service')
const slug = require('../../../../util/slug')
const db = require('../../../db')
const fs = require("fs")
const convertFile = require('../../../../util/base64tofile')
const productservice = require("../../../services/product.service")
const adminService = require("../../../services/auth.service")
const csv = require('csv-parser');
const activity = require("../../../../util/activity.creator");
const fileImportService = require("../../../services/file.import.service")

const getAdminDetails = async (email) => {
    const details = await adminService.adminDetails({ email: email, isActive: true, isDelete: false })
    return details
}

exports.getBrands = async (req, res) => {
    try {
        const brands = await service.getBrands(query,)
        helper.deliverResponse(res, 200, brands, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        });
    } catch (error) {
        helper.deliverResponse(res, 422, error, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.create = async (req, res) => {
    try {
        const { email } = res?.locals?.user
        const admin = await getAdminDetails(email)
        const { body } = req;
        body.brandid = await service.count({}) + 1
        body.createdBy = admin?._id
        body.slug = await slug.createSlug(db.Brand, body.name, { slug: await slug.generateSlug(body.name) });
        let response = await service.create(body);
        if (response instanceof Error) {
            helper.deliverResponse(res, 422, response, {
                "error_code": messages.serverError.error_code,
                "error_message": messages.serverError.error_message
            });
        } else {
            helper.deliverResponse(res, 200, response, {
                "error_code": messages.BRAND_SUCCESS.error_code,
                "error_message": messages.BRAND_SUCCESS.error_message
            });
        }
    } catch (error) {
        helper.deliverResponse(res, 422, error, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.getBrandsByPage = async (req, res, next) => {
    try {
        const { page, limit } = req.query
        let response = await service.pagination(page, limit)
        helper.deliverResponse(res, 200, response, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        });
    } catch (error) {
        helper.deliverResponse(res, 422, error, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.updateMedia = async (req, res, next) => {
    try {
        const { type } = req.params
        const { body } = req
        let path = ''

        if (!body.url) {
            const filepath = await convertFile(body?.media?.url, body?.media?.name, "brand")
            path = 'uploads' + filepath
        } else {
            path = body.url
        }

        let payload = {}
        type == 'cover' ? payload['banner'] = path : payload['file'] = path
        const brandDetails = await service.updateBrandById({ brandid: body?.brand }, payload)
        if (brandDetails instanceof Error) {
            helper.deliverResponse(res, 422, brandDetails, {
                "error_code": messages.serverError.error_code,
                "error_message": messages.serverError.error_message
            });
        } else {
            helper.deliverResponse(res, 200, {}, {
                "error_code": messages.BRAND_UPDATE.error_code,
                "error_message": messages.BRAND_UPDATE.error_message
            });
        }
    } catch (error) {
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.removeCoverImage = async (req, res, next) => {
    try {
        const { brand } = req.params
        const brandDetails = await service.updateBrandById({ brandid: brand }, { banner: null })
        if (brandDetails instanceof Error) {
            helper.deliverResponse(res, 422, brandDetails, {
                "error_code": messages.serverError.error_code,
                "error_message": messages.serverError.error_message
            });
        } else {
            helper.deliverResponse(res, 200, {}, {
                "error_code": messages.BRAND_UPDATE.error_code,
                "error_message": messages.BRAND_UPDATE.error_message
            });
        }
    } catch (error) {
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.searchBrands = async (req, res, next) => {
    try {
        const { body } = req
        let data = { isDelete: false, isArchive: false }
        if (body?.keyword) data.name = { $regex: body?.keyword, $options: 'i' }
        if (body?.isActive) data['isActive'] = body?.isActive
        if (body?.isFeatured) data['isFeatured'] = body?.isFeatured
        if (body?.isArchive) data['isArchive'] = body?.isArchive
        const brands = await service.getBrandBySearch(data, body?.page, body?.limit)
        helper.deliverResponse(res, 200, brands, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        });
    } catch (error) {
        helper.deliverResponse(res, 422, error, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.getActiveBrands = async (req, res) => {
    try {
        let response = await service.getBrands({
            isDelete: false,
            isActive: true,
            isArchive: false
        })
        helper.deliverResponse(res, 200, response, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        });
    } catch (error) {
        helper.deliverResponse(res, 422, error, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.getBrandDetails = async (req, res, next) => {
    try {
        const { slug } = req.query;
        let response = await service.findOne({ slug: slug })
        helper.deliverResponse(res, 200, response, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        });
    } catch (error) {
        helper.deliverResponse(res, 422, error, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.deleteBrand = async (req, res, next) => {
    try {
        const { brand } = req.params
        const repsonse = await service.updateOne({ _id: brand }, { isDelete: true })
        if(repsonse instanceof Error){
            helper.deliverResponse(res, 422, repsonse, {
                "error_code": messages.serverError.error_code,
                "error_message": messages.serverError.error_message
            });
        }else{
            activity.logActivity(res.locals.user.email, `Brand deleted`);
            helper.deliverResponse(res, 200, repsonse, {
                "error_code": messages.BRAND_DELETE.error_code,
                "error_message": messages.BRAND_DELETE.error_message
            })
        }
    } catch (error) {
        helper.deliverResponse(res, 422, error, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.updateBrand = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            helper.deliverResponse(res, 422, errors, {
                "error_code": messages.VALIDATION_ERROR.error_code,
                "error_message": messages.VALIDATION_ERROR.error_message
            })
            return;
        }

        const { body } = req;
        const brandDetails = await service.getBrand({ brandid: body?.brandid, isDelete: false })

        if (body.name) {
            body?.name == brandDetails?.name
                ? null
                : body.slug = await slug.createSlug(db.Brand, body?.name, { slug: await slug.generateSlug(body?.name) })
        }

        if (body.isArchive == "true" || body.isActive == "false") {
            const productExists = await productservice.checkBrand({ brand: brandDetails?._id, isDelete: false })
            if (productExists.length > 0) {
                helper.deliverResponse(res, 422, {}, {
                    "error_code": messages.BRAND_NOT_DELETE.error_code,
                    "error_message": messages.BRAND_NOT_DELETE.error_message
                });
            } else {
                let response = await service.updateBrand(body?.brandid, body)
                if (response instanceof Error) {
                    helper.deliverResponse(res, 422, response, {
                        "error_code": messages.serverError.error_code,
                        "error_message": messages.serverError.error_message
                    });
                } else {
                    helper.deliverResponse(res, 200, response, {
                        "error_code": messages.BRAND_DELETE.error_code,
                        "error_message": messages.BRAND_DELETE.error_message
                    });
                }
            }
        } else {
            let response = await service.updateBrand(body?.brandid, body)
            if (response instanceof Error) {
                helper.deliverResponse(res, 422, response, {
                    "error_code": messages.serverError.error_code,
                    "error_message": messages.serverError.error_message
                });
            } else {
                helper.deliverResponse(res, 200, response, {
                    "error_code": messages.BRAND_UPDATE.error_code,
                    "error_message": messages.BRAND_UPDATE.error_message
                });
            }
        }
    } catch (error) {
        console.log("Error caught in update brand API :: " + error);
        helper.deliverResponse(res, 422, error, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.archivedBrands = async (req, res, next) => {
    try {
        const { page } = req.query
        const { body } = req
        const data = {}
        data["name"] = { $regex: body["name"], $options: 'i' }
        data["isArchive"] = true
        data["isDelete"] = false
        const limit = 30
        let brand = await service.getBrandBySearch(data, page, limit)
        helper.deliverResponse(res, 200, brand, {
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

exports.restoreBrand = async (req, res, next) => {
    try {
        const { brand } = req.params
        let response = await service.updateOne({ _id: brand }, { isArchive: false })
        helper.deliverResponse(res, 200, response, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        });
    } catch (error) {
        helper.deliverResponse(res, 422, error, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.brandImages = async (req, res, next) => {
    try {
        let brands = await service.getBrands({}, { name: 1 })
        let images = []
        for (let brand of brands) if (!images.includes(brand.file)) images.push(brand.file)
        let response = { images: images }
        helper.deliverResponse(res, 200, response, {
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

exports.bulkMediaUpload = async (req, res, next) => {
    try {
        helper.deliverResponse(res, 200, { count: req?.files?.path }, {
            "error_code": messages.BRAND_BULK_SUCCESS.error_code,
            "error_message": messages.BRAND_BULK_SUCCESS.error_message
        });
    } catch (error) {
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.bulkFileUpload = async (req, res, next) => {
    try {
        const rootDir = process.cwd();
        const startTime = performance.now();
        const file = rootDir + "/" + req?.file?.path
        const { email } = res?.locals?.user
        const adminDetails = await getAdminDetails(email)

        const fileDetails = await fileImportService.create({
            title: req?.file?.originalname, createdBy: adminDetails?._id,
            slug: await slug.createSlug(db.FileImport, req?.file?.originalname, { slug: await slug.generateSlug(req?.file?.originalname) }),
            status: 'awaiting', type: 'brands',
        })

        if (fileDetails instanceof Error) {
            helper.deliverResponse(res, 422, {}, {
                "error_code": messages.serverError.error_code,
                "error_message": messages.serverError.error_message
            });
        } else {
            let counter = 0;
            const processPromises = [];
            let processFailed = false;
            await new Promise((resolve, reject) => {
                fs.createReadStream(file).pipe(csv()).on('data', async (row) => {
                    if (processFailed) return;
                    counter++;
                    const processPromise = processRow(row, counter);
                    processPromises.push(processPromise);
                    try {
                        await processPromise;
                    } catch (error) {
                        processFailed = true; // Set flag to stop processing
                        reject(error);
                    }
                }).on('end', async () => {
                    await Promise.all(processPromises);
                    resolve();
                }).on('error', (error) => {
                    reject(error);
                });
            })

            if (!processFailed) {
                const endTime = performance.now();
                const executionTime = endTime - startTime;
                const fileAfterSuccess = await fileImportService.update({ _id: fileDetails._id }, {
                    status: 'completed',
                    executionTime: executionTime,
                    dataImported: counter
                });

                if (fileAfterSuccess instanceof Error) {
                    helper.deliverResponse(res, 422, fileAfterSuccess, {
                        "error_code": messages.serverError.error_code,
                        "error_message": messages.serverError.error_message
                    });
                } else {
                    await activity.logActivity(email, 'Brands (csv) uploaded');
                    helper.deliverResponse(res, 200, { total: counter }, {
                        "error_code": 0,
                        "error_message": counter + " brands uploaded successfully"
                    });
                }
            } else {
                const fileAfterFailure = await fileImportService.update(
                    { _id: fileDetails._id }, {
                    status: 'failed',
                });

                if (fileAfterFailure instanceof Error) {
                    helper.deliverResponse(res, 422, fileAfterFailure, {
                        "error_code": messages.serverError.error_code,
                        "error_message": messages.serverError.error_message
                    });
                } else {
                    helper.deliverResponse(res, 200, { total: counter }, {
                        "error_code": 1,
                        "error_message": "Failed to upload the csv file"
                    });
                }
            }
        }
    } catch (error) {
        console.log("Error caught in bulk import brand :: " + error);
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

function processRow(row, counter) {
    return new Promise(async (resolve, reject) => {
        const brandDetails = await db.Brand.findOne({ name: row?.NAME, isDelete: false })
        const thumbnailDetails = await db.Media.findOne({ title: row.IMAGE })
        const payload = {
            name: row.NAME,
            thumbnail: thumbnailDetails?._id,
            isActive: row.ACTIVE == '0' ? true : false,
            isFeatured: row.FEATURED == '0' ? true : false,
            slug: brandDetails?.name != row?.NAME ? await slug.createSlug(db.Brand, row.NAME, { slug: await slug.generateSlug(row.NAME) }) : brandDetails?.slug,
            brandid: !brandDetails ? counter + 1 : brandDetails?.brandid,
            style: {
                text: { color: '#000000', fontSize: 14, fontWeight: 400 },
                background: '#ffffff',
                border: '#e6e6e6',
                radius: 10
            }
        }
        brandDetails ? await service.updateBrandById({ name: row?.NAME }, payload) : await service.createBrand(payload)
        resolve();
    });
}

