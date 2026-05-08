const express = require("express")
const router = express.Router()
const controller = require("../../../../controllers/web/backend/content.controller")
const contactController = require("../../../../controllers/web/backend/contact.controller")
const footerController = require("../../../../controllers/web/backend/footer.controller")

module.exports = () => {
    router.post("/manage-content", controller.manageContent);
    router.get("/get-contents", controller.getContents);

    router.post("/manage-contactcms", contactController.create)
    router.get("/contactcms-details", contactController.findOne)

    router.post("/manage-footer", footerController.manageFooter)
    router.get("/footer-details", footerController.getFooter)

    return router;
}