const multer = require("multer");
const fs = require("fs");
const mediaService = require("../services/media.service");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let folderpath = 'uploads/medias';
        if (req.path == '/csv-productimages') folderpath = 'uploads/assets';
        fs.mkdirSync(folderpath, { recursive: true });
        cb(null, folderpath);
    },
    filename: async function (req, file, cb) {
        const mediaDetails = await mediaService.findOne({ title: file.originalname })
        mediaDetails ? filename = `copy${Date.now()}_` + file.originalname : filename = file.originalname
        cb(null, filename);
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 50, },
});

module.exports = upload;
