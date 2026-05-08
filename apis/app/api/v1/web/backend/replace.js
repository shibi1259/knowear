const express = require("express");
const router = express.Router();
const controller = require("../../../../controllers/web/backend/replace.controller")

module.exports = () => {
    router.put('/update-replace',  controller.updateRequest)
    router.get('/replace-requests', controller.replaceRequests)
    router.get('/replace-details/:replace', controller.replaceDetails)

    return router;
}
