const express = require("express");
const router = express.Router();
const controller = require("../../../../controllers/web/backend/blog.controller");
const upload = require("../../../../../util/upload")

module.exports = () => {
    router.post("/create-blog", upload.any("files"), controller.validate("create"), controller.create);
    router.put("/update-blog", upload.any("files"), controller.validate("update"), controller.update);
    router.delete("/delete-blog/:blog", controller.delete);
    router.post("/blogs", controller.search);
    router.get('/blogs/:blog', controller.details);

    return router;
};
