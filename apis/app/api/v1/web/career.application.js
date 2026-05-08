const express = require("express");
const router = express.Router();
const { create } = require("../../../controllers/web/backend/career.application.controller");
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');
const { S3Client } = require("@aws-sdk/client-s3");

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const upload = multer({
    storage: multerS3({
        s3: s3Client,
        bucket: process.env.AWS_S3BUCKET_NAME,
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            const fileName = `resumes/${Date.now()}-${file.originalname}`;
            cb(null, fileName);
        }
    }),
    fileFilter: function (req, file, cb) {
        const filetypes = /pdf|doc|docx/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb('Error: Allow only .pdf, .doc, .docx files!');
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 } // limit file size to 5MB
});

module.exports = () => {
    router.post("/submit-careerapplication", upload.single("resume"), create)

    return router;
};
