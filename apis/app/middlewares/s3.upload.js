// // middlewares/media-uploader.js
// const multer = require("multer");
// const multerS3 = require('multer-s3');
// const { s3, bucketName } = require('../../config/aws/aws.config');
// const mediaService = require("../services/media.service");

// const uploadToS3 = multer({
//     storage: multerS3({
//         s3: s3,
//         bucket: bucketName,
//         contentType: multerS3.AUTO_CONTENT_TYPE,
//         // acl: 'public-read',
//         key: async function (req, file, cb) {
//             const mediaDetails = await mediaService.findOne({ title: file.originalname });
//             const filename = mediaDetails ? `${Date.now()}_${file.originalname}` : file.originalname;
//             cb(null, filename);
//         }
//     }),
//     limits: {
//         fileSize: 1024 * 1024 * 50, // 50MB
//     },
// });

// module.exports = uploadToS3;
const multer = require("multer");
const multerS3 = require('multer-s3');
const { s3, bucketName } = require('../../config/aws/aws.config');
const mediaService = require("../services/media.service");

const uploadToS3 = multer({
    storage: multerS3({
        s3: s3,
        bucket: bucketName,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: async function (req, file, cb) {
            const timestamp = Date.now();
            const fileExtension = file?.originalname.split('.').pop(); 
            const baseName = file?.originalname.replace(/\.[^/.]+$/, '').replace(/\s+/g, '-'); 
            const newFileName = `${baseName}-${timestamp}.${fileExtension}`;
            const mediaDetails = await mediaService.findOne({ title: newFileName });
            const filename = mediaDetails ? `${newFileName}` : newFileName;
            cb(null, filename);
        },
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        contentDisposition: function (req, file, cb) {
            cb(null, 'inline');
        }
    }),
    limits: { fileSize: 1024 * 1024 * 500 },
});

module.exports = uploadToS3;