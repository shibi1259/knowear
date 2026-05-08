const express = require("express");
const router = express.Router();
const controller = require("../../../controllers/web/backend/wallet.transaction.controller");
const authorize = require("../../../middlewares/authorize");

module.exports = () => {
    router.get('/wallet-transactions', authorize.verifyToken, controller.walletTransactions)
    router.post('/redeem-voucher', authorize.verifyToken, controller.redeemVoucher)

    return router;
};