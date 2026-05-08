const express = require("express")
const router = express.Router()
const controller = require("../../../../controllers/web/backend/invoice.controller")

module.exports = () => {
    router.post("/create-invoicedetails", controller.create);
    router.get("/invoice-details", controller.findOne);
    router.put("/update-invoicedetails", controller.update);
    
    return router;
}
