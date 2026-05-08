const express = require('express');
const router = express.Router();
const controller = require('../../../../controllers/web/backend/reset.controller');

module.exports = () => {
    router.delete("/reset-products", controller.dropProducts)
    router.delete("/reset-users", controller.dropUsers)
    router.delete("/reset-orders", controller.dropOrders)

    return router;
}
