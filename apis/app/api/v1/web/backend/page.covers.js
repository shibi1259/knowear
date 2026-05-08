const express = require("express")
const router = express.Router()
const controller = require("../../../../controllers/web/backend/page.covers.controller")

module.exports = () => {
    router.post("/add-pagecover", controller.createCovers)
    router.post("/pagecovers", controller.pageCovers)
    router.get("/pagecover/:id", controller.pageCoverDetails)
    router.put("/update-pagecover", controller.updateCovers)
    router.delete("/delete-pagecover/:id", controller.deletePageCover)

    return router;
}