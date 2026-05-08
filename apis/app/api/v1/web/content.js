const express = require("express");
const router = express.Router();
const controller = require("../../../controllers/web/content.controller");
const contactController = require("../../../controllers/web/backend/contact.controller")

module.exports = () => {
    router.get('/faq', controller.faq)
    router.get('/about', controller.about)
    router.get('/help-center', controller.help)
    router.get('/footer', controller.footer)
    router.get('/contact-us', contactController.findOne)
    router.get('/page-contents', controller.pageContents)
    router.get('/footer-details', controller.getFooter)

    return router;
};
