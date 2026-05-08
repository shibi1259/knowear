const express = require("express");
const router = express.Router();
const controller = require("../../../../controllers/web/backend/return.controller")

module.exports = () => {
    router.post('/returns', controller.validate("search"), controller.returns)
    router.get('/returns/:reference', controller.returnDetails)
    router.put('/update-return', controller.validate("update"), controller.update)

    return router;
}
