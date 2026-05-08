const multer = require("multer");
const fs = require("fs");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let folder = 'uploads/web';
        switch(req?.query?.type){
            case 'return':
                folder = 'uploads/web/returns';
                break;
            case 'gifts':
                folder = 'uploads/web/gifts';
                break;
            default:
                folder = 'uploads/web';
                break;
        }
        fs.mkdirSync(folder, { recursive: true });
        cb(null, folder);
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
