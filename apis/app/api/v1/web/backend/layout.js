const express = require('express')
const router = express.Router();
const controller = require("../../../../controllers/web/backend/home.section.controller");
const upload = require("../../../../../util/upload");

module.exports = () => {
    router.post("/add-layout", upload.array('file', 100), controller.validate('create'), controller.create)
    router.get("/layouts", controller.getAllHomeSection)
    router.get("/layout-page", controller.geLayoutsByPage)
    router.get("/layouts/count", controller.geLayoutsCount)
    router.get("/layouts/active", controller.getActive)
    router.get("/layout", controller.getBySlug)
    router.put("/update-layout", upload.array('file', 100), controller.updateHomeSection)

    return router;
}