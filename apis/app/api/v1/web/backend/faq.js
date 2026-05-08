const express = require("express")
const router = express.Router()
const controller = require("../../../../controllers/web/backend/faq.controller")

module.exports = () => {
   router.post("/create-faq", controller.create)
   router.get("/get-faqs", controller.getFaqs)
   router.get("/active-faqs", controller.activeFaqs)
   router.get("/faq-details/:faqId", controller.faqDetails)
   router.put("/update-faq/:faqId", controller.update)
   router.delete("/delete-faq/:faqId", controller.delete)

   return router;
}