const helper = require('../../../../util/responseHelper')
const { body, validationResult } = require('express-validator')
const messages = require('../../../../config/constants').messages
const fs = require('fs');
const slug = require("../../../../util/slug");
const db = require("../../../db");
const unzipper = require('unzipper');
const mediaService = require('../../../services/media.service')
const adminService = require('../../../services/auth.service')
const path = require('path');
const activity = require("../../../../util/activity.creator");
const fileImportService = require('../../../services/file.import.service')

const getAdminDetails = async (email) => {
    const details = await adminService.adminDetails({ email: email, isActive: true, isDelete: false })
    return details
}

function bytesToMegabytes(bytes) {
    return bytes / (1024 * 1024);
}

exports.importImages = async (req, res) => {
    try {
        const { type } = req.query
        let uploadedTo = "medias"
        let folder = process.cwd() + '/uploads/medias';
        const { email } = res?.locals?.user
        const zippedAsset = `${process.cwd()}/${req.file.path}`
        let unzippedAsset = `${process.cwd()}/uploads/assets`
        const adminDetails = await getAdminDetails(email)

        switch (type) {
            case 'products':
                unzippedAsset = `${unzippedAsset}/products`
                uploadedTo = "products"
                folder = `${folder}/products`
                break;
            case 'brands':
                unzippedAsset = `${unzippedAsset}/brands`
                uploadedTo = "brands"
                folder = `${folder}/brands`
                break;
            case 'categories':
                unzippedAsset = `${unzippedAsset}/categories`
                uploadedTo = "categories"
                folder = `${folder}/categories`
                break;
            default:
                break;
        }

        const start = Date.now();
        const fileImportDetails = await fileImportService.create({
            title: req.file.filename,
            type: uploadedTo,
            slug: await slug.createSlug(db.FileImport, req.file.filename.split('.')[0], { slug: await slug.generateSlug(req.file.filename.split('.')[0]) }),
            refid: await fileImportService.count({}) + 1,
            createdBy: adminDetails?._id,
        })
        fs.createReadStream(zippedAsset).pipe(unzipper.Extract({ path: unzippedAsset })).on('error', (err) => {
            fileImportService.update({ _id: fileImportDetails?._id }, { status: 'failed' })
            helper.deliverResponse(res, 422, err, {
                "error_code": 1,
                "error_message": "Error caught while unzipping the file. Please try again."
            });
        }).on('finish', () => {
            let dataImported = 0
            fs.readdir(`${unzippedAsset}/images`, (err, files) => {
                if (err) {
                    fileImportService.update({ _id: fileImportDetails._id }, { status: 'failed' })
                    helper.deliverResponse(res, 422, err, {
                        "error_code": 1,
                        "error_message": "Error caught while reading the unzipped files. Please try again."
                    });
                    return;
                }

                !fs.existsSync(folder) ? fs.mkdirSync(folder) : null
                fileImportService.update({ _id: fileImportDetails?._id }, { status: 'progress' })
                files.forEach((file) => {
                    const filePath = `${unzippedAsset}/images/${file}`;
                    fs.stat(filePath, async (error, stats) => {
                        if (error) {
                            fileImportService.update({ _id: fileImportDetails._id }, { status: 'failed' })
                            helper.deliverResponse(res, 422, error, {
                                "error_code": 1,
                                "error_message": "Error caught while reading the file details. Please try again."
                            });
                            return;
                        }

                        let type = "image"
                        const fileType = file.split('.').pop();
                        if (['jpg', 'jpeg', 'png', 'gif'].includes(fileType.toLowerCase())) {
                            type = "image"
                        } else if (['mp4', 'avi', 'mov'].includes(fileType.toLowerCase())) {
                            type = "video"
                        } else {
                            type = "other"
                        }

                        fs.copyFile(filePath, `${folder}/${file}`, async (error) => {
                            if (error) {
                                helper.deliverResponse(res, 422, err, {
                                    "error_code": 1,
                                    "error_message": "Error caught while reading the file details. Please try again."
                                });
                            }

                            let title = file
                            const mediaDetails = await mediaService.findOne({ title: title })
                            mediaDetails ? title = `${new Date().getTime()}${title}` : null
                            await mediaService.create({
                                tag: type,
                                title: file,
                                altTitle: `${file.split('.')[0]}`,
                                path: `uploads/medias/${uploadedTo}/${file}`,
                                type: `${type}/${fileType}`,
                                size: bytesToMegabytes(stats.size).toFixed(2),
                                slug: await slug.createSlug(db.Media, title.split('.')[0], { slug: await slug.generateSlug(title.split('.')[0]) }),
                                uploadedBy: adminDetails?._id,
                                uploadedTo: uploadedTo,
                                uploadedDescription: `Bulk upload of ${uploadedTo} images`
                            });
                        });
                    });
                    dataImported++
                });
                fs.rm(unzippedAsset, { recursive: true, force: true }, (err) => { })
                const end = Date.now();
                const executionTime = end - start; //milliseconds
                const executionTimeInSeconds = (executionTime / 1000).toFixed(2);
                fileImportService.update({ _id: fileImportDetails?._id }, {
                    status: 'completed',
                    executionTime: executionTimeInSeconds,
                    dataImported: dataImported
                })
                activity.logActivity(res?.locals?.user?.email, `Bulk upload of ${uploadedTo} images`)
            });
            helper.deliverResponse(res, 200, {}, {
                "error_code": messages.FILES_UPLOADED.error_code,
                "error_message": messages.FILES_UPLOADED.error_message
            });
        });
    } catch (error) {
        console.log("Error caught in product images :: " + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}