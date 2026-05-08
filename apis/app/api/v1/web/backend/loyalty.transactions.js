const express = require("express");
const router = express.Router();
const controller = require("../../../../controllers/web/backend/loyalty.transaction.controller");

module.exports = () => {
    router.get('/get-loyalty-history/:customer', controller.getTransactions)

    return router;
};