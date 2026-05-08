const express = require("express")
const router = express.Router()
const controller = require("../../../../controllers/web/backend/delivery.slots.controller")

module.exports = () => {
    router.post("/add-delivery-slot", controller.validate('create'), controller.create)
    router.get("/delivery-slots", controller.getDeliverySlots)
    router.get("/delivery-slots-per-day/:day", controller.getDeliverySlotsPerDay)
    router.get("/delivery-slots-perday/:day", controller.getDeliverySlotsForDay)
    router.get("/delivery-slots/:delivery", controller.getDeliverySlotDetails)
    router.put("/update-delivery-slot", controller.validate('update'), controller.update)
    router.put("/update-delivery-slots", controller.updateSlots)
    router.delete("/delete-delivery-slot/:delivery", controller.delete)

    return router;
}