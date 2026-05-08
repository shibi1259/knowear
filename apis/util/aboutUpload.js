const multer = require("multer");
const fs = require("fs");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const folderPath = `uploads/images`;
        fs.mkdirSync(folderPath, { recursive: true });
        cb(null, folderPath);
    },
    filename: function (req, file, cb) {
        filename = Date.now() + "-" + file.originalname;
        cb(null, filename);
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 50, },
});

module.exports = upload;