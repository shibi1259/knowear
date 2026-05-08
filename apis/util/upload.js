const multer = require("multer");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let folderPath = `uploads/bulk-files`;
    if (req.path == '/update-settings') folderPath = `uploads/settings`;
    if (req.path == '/app-icons') folderPath = `uploads/app-icons`;
    if (req.path == '/splash-icons') folderPath = `uploads/splash-icons`;
    if (req.path == '/manage-popup') folderPath = `uploads/medias`;
    if (req.path == '/product-video') folderPath = `uploads/product-videos`;
    if (req.path == '/add-productcover') folderPath = `uploads/product-covers`;
    if (req.path == '/create-blog' || req.path == '/update-blog') folderPath = `uploads/medias`;

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
