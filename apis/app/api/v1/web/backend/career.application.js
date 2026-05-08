const express = require("express");
const router = express.Router();
const { search, findOne, update } = require("../../../../controllers/web/backend/career.application.controller");

module.exports = () => {
    router.get("/career-applications", search);
    router.get("/career-application/:applicationId", findOne);

    return router;
}