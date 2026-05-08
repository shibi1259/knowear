const { body, validationResult } = require("express-validator");
const helper = require("../../../../util/responseHelper");
const { messages } = require("../../../../config/constants");
const service = require("../../../services/media.service");
const adminService = require("../../../services/auth.service")
const fs = require('fs');
const activity = require("../../../../util/activity.creator")
const axios = require('axios');
const media = require("../../../../util/media.uploader");
const { log } = require("winston");
const { s3, bucketName }= require("../../../../config/aws/aws.config")
const { DeleteObjectCommand,  GetObjectCommand } = require("@aws-sdk/client-s3");


exports.validate = (method) => {
    switch (method) {
        case 'search': {
            return [
                body('page', `Page is required`).exists(),
                body('limit', `Limit is required`).exists(),
            ]
        }
    }
}

exports.getMedias = async (req, res) => {
    try {
      
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            helper.deliverResponse(res, 422, errors, {
                "error_code": messages.VALIDATION_ERROR.error_code,
                "error_message": messages.VALIDATION_ERROR.error_message
            })
            return;
        }

        const { body } = req
        let sort = { createdAt: -1 }
        let query = {}
        if (body.type) query['tag'] = body.type
        if (body.keyword) query['title'] = { $regex: body.keyword, $options: 'i' }
        if (body.date) query['$and'] = [
            { createdAt: { $gte: new Date(new Date(body.date).setHours(0, 0, 0, 0)).toISOString() } },
            { createdAt: { $lte: new Date(new Date(body.date).setHours(23, 59, 59, 59)).toISOString() } }
        ]
        const medias = await service.search(query, { createdAt: 1, size: 1, path: 1, slug: 1, _id: 1, title: 1, altTitle: 1, tag: 1 }, sort, body.page, body.limit)

        helper.deliverResponse(res, 200, medias, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        });
    } catch (error) {
        console.log('Error caught in get medias API :: ' + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.addMedias = async (req, res) => {
    try {
        const { files } = req;
       

        const { email } = res?.locals?.user
        for (let file of files) {
            await media.uploader(email, {
                filename: file?.key,
                path: file?.location.split(process.env.BASE_URL)[1],
                mimetype: file?.contentType,
                size: file?.size,
            }, { to: 'media', description: 'Media gallery' })
        }
        activity.logActivity(email, `${files.length} files uploaded to media gallery`)
        helper.deliverResponse(res, 200, {}, {
            "error_code": messages.FILE_UPLOAD_SUCCESS.error_code,
            "error_message": messages.FILE_UPLOAD_SUCCESS.error_message
        });
    } catch (error) {
        console.log('Error caught in add medias API :: ' + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.getMediaDetails = async (req, res) => {
    try {
        const { mediaId } = req.params
        const response = await service.findOne({ _id: mediaId })
       
        helper.deliverResponse(res, 200, response, messages.successResponse);
    } catch (error) {
        console.log('Error caught in get media details API :: ' + error)
        helper.deliverResponse(res, 422, {}, messages.serverError);
    }
}

exports.updateMedia = async (req, res) => {
    try {
        const { mediaId } = req.params
        let { body } = req
        const { email } = res?.locals?.user
        const mediaDetails = await service.findOne({ _id: mediaId })
        let isTitle = false
        let message = mediaDetails.title + ' updated'
        mediaDetails.title == body.title ? null : isTitle = true
        let isRenamed = true
        if (isTitle) {
            const oldPath = process.cwd() + '/uploads/medias/' + mediaDetails.title
            const newPath = process.cwd() + '/uploads/medias/' + body.title
            body.path = `uploads/medias/${body.title}`
            fs.renameSync(oldPath, newPath, (error) => {
                if (error) isRenamed = false
            })
            message = mediaDetails.title + ' changed to ' + body.title
        }

        if (isRenamed) {
            activity.logActivity(email, message)
            const response = await service.update({ _id: mediaId }, body)
            if (response instanceof Error) {
                return helper.deliverResponse(res, 422, {}, messages.serverError);
            } else {
                return helper.deliverResponse(res, 200, response, messages.FILE_UPDATED);
            }
        } else {
            return helper.deliverResponse(res, 200, response, messages.successResponse);
        }
    } catch (error) {
        console.log('Error caught in get media details API :: ' + error)
        return helper.deliverResponse(res, 422, error, messages.serverError);
    }
}

exports.downloadMedia = async (req, res) => {
    try {
        const { mediaId } = req.params;
        const mediaDetails = await service.findById(mediaId);
        const getObjectParams = {
          Bucket: bucketName,
          Key: mediaDetails.title,
        };
    
        const command = new GetObjectCommand(getObjectParams);
        const response = await s3.send(command);
    
        res.setHeader('Content-Type', response.ContentType);
        res.setHeader('Content-Disposition', `attachment; filename="${mediaDetails.title}"`);
    
        response.Body.pipe(res);
    } catch (error) {
        console.log('Error caught in download media API :: ' + error)
        helper.deliverResponse(res, 422, error, messages.serverError);
    }
}

exports.saveMediaUrls = async (req, res) => {
    try {
        const { body } = req
        const { email } = res?.locals?.user
        const urls = body.urls.split('||')
        for (let url of urls) {
            const fileName = new Date().getTime() + '-' + url.split('/').pop();
            const destination = process.cwd() + '/uploads/medias/' + fileName
            await downloadImage(url, destination)
            await media.uploader(email, {
                filename: fileName,
                path: 'uploads/medias/' + fileName,
                mimetype: 'image/jpg',
                size: '0.00',
            }, { to: 'media', description: 'Media gallery' })
        }
        helper.deliverResponse(res, 200, {}, {
            "error_code": messages.FILES_UPLOADED.error_code,
            "error_message": messages.FILES_UPLOADED.error_message
        });
    } catch (error) {
        console.log('Error caught in save media urls API :: ' + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

async function downloadImage(imageUrl, outputPath) {
    try {
        axios({ method: 'get', url: imageUrl, responseType: 'stream' }).then(response => {
            const writer = fs.createWriteStream(outputPath);
            response.data.pipe(writer);
            writer.on('finish', () => { console.log('Image saved successfully') })
            writer.on('error', err => { console.error('Error saving image :: ', err) })
        }).catch(error => {
            console.error('Error fetching image:', error);
        });
    } catch (error) {
        throw error;
    }
}

exports.deleteMedias = async (req, res) => {
    try {
        const { body } = req
        const { email } = res?.locals?.user
        for (const file of body.files) {
            const filePath = process.cwd() + "/" + file.path
            if (doesFileExist(filePath)) {
                fs.unlinkSync(filePath)
                activity.logActivity(email, file.path.split('/').pop() + ' deleted')
            }
            await service.delete({ slug: file.slug })
        }
        helper.deliverResponse(res, 200, {}, {
            "error_code": messages.FILES_DELETED.error_code,
            "error_message": messages.FILES_DELETED.error_message
        });
    } catch (error) {
        console.log('Error caught in delete medias API :: ' + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

function doesFileExist(filePath) {
    try {
        if (fs.existsSync(filePath)) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        return false;
    }
}

function bytesToMegabytes(bytes) {
    return bytes / (1024 * 1024);
}