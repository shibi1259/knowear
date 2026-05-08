const express = require("express")
const router = express.Router()
const tncController = require("../../../../controllers/web/backend/tnc.controller")

module.exports = () => {
    router.post("/tnc/create", tncController.validate('create'), tncController.create)
    router.get("/tnc-all", tncController.getAllTnc)
    router.get("/tnc-active", tncController.getActiveTnc)
    router.get("/tnc", tncController.getTncBySlug)
    router.put("/tnc/update",  tncController.validate('update'), tncController.updateTnc)
    return router;
}