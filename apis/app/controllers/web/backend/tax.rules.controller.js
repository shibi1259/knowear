const helper = require("../../../../util/responseHelper");
const { body, validationResult } = require("express-validator");
const messages = require("../../../../config/constants").messages;
const service = require("../../../services/tax-rules.service");
const classService = require("../../../services/tax-class.service");
const slug = require("../../../../util/slug");
const db = require("../../../db");
const adminService = require("../../../services/auth.service");

const getAdminDetails = async (email) => {
    const details = await adminService.adminDetails({ email: email, isActive: true, isDelete: false });
    return details;
};

exports.validate = (method) => {
    switch (method) {
        case "add": {
            return [body("name", `Name is required`).exists(), body("rate", `Rate is required`).exists()];
        }
        case "update": {
            return [body("name", `Name is required`).exists(), body("rate", `Rate is required`).exists(), body("slug", `Slug is required`).exists()];
        }
        case "search": {
            return [body("page", `Page is required`).exists(), body("limit", `Limit is required`).exists()];
        }
    }
};

exports.create = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            helper.deliverResponse(res, 422, errors, {
                error_code: messages.VALIDATION_ERROR.error_code,
                error_message: messages.VALIDATION_ERROR.error_message,
            });
            return;
        }

        let { body } = req;

        //Name validation
        const nameExists = await service.findOne({ name: body.name, isDelete: false });
        if (nameExists) {
            return helper.deliverResponse(res, 200, {}, messages.RULE_EXISTS);
        }

        const { email } = res?.locals?.user;
        const admin = await getAdminDetails(email);
        body.createdBy = admin?._id;
        body.slug = await slug.createSlug(db.TaxRules, body.name, { slug: await slug.generateSlug(body.name) });
        let response = await service.create(body);
        if (response instanceof Error) {
            helper.deliverResponse(
                res,
                422,
                {},
                {
                    error_code: messages.serverError.error_code,
                    error_message: messages.serverError.error_message,
                }
            );
        } else {
            helper.deliverResponse(res, 200, response, {
                error_code: messages.ADD_TAXRULE.error_code,
                error_message: messages.ADD_TAXRULE.error_message,
            });
        }
    } catch (error) {
        console.log("Error caught in create tax rule API :: " + error);
        helper.deliverResponse(
            res,
            422,
            {},
            {
                error_code: messages.serverError.error_code,
                error_message: messages.serverError.error_message,
            }
        );
    }
};

exports.taxRules = async (req, res, next) => {
    try {
        let rules = await service.find({ isDelete: false });
        helper.deliverResponse(res, 200, rules, {
            error_code: messages.successResponse.error_code,
            error_message: messages.successResponse.error_message,
        });
    } catch (error) {
        helper.deliverResponse(
            res,
            422,
            {},
            {
                error_code: messages.serverError.error_code,
                error_message: messages.serverError.error_message,
            }
        );
    }
};

exports.activeTaxRules = async (req, res, next) => {
    try {
        let rules = await service.find({ isDelete: false, isActive: true });
        helper.deliverResponse(res, 200, rules, {
            error_code: messages.successResponse.error_code,
            error_message: messages.successResponse.error_message,
        });
    } catch (error) {
        helper.deliverResponse(
            res,
            422,
            {},
            {
                error_code: messages.serverError.error_code,
                error_message: messages.serverError.error_message,
            }
        );
    }
};

exports.search = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            helper.deliverResponse(res, 422, errors, {
                error_code: messages.VALIDATION_ERROR.error_code,
                error_message: messages.VALIDATION_ERROR.error_message,
            });
            return;
        }

        const { body } = req;
        let data = { isDelete: false };
        if (body?.keyword) data["name"] = { $regex: body.keyword, $options: "i" };
        let rules = await service.search(data, body.page, body.limit, { __v: 0, _id: 0, createdAt: 0, updatedAt: 0 });
        helper.deliverResponse(res, 200, rules, {
            error_code: messages.successResponse.error_code,
            error_message: messages.successResponse.error_message,
        });
    } catch (error) {
        console.log("Error caught in search tax rule API :: " + error);
        helper.deliverResponse(
            res,
            422,
            {},
            {
                error_code: messages.serverError.error_code,
                error_message: messages.serverError.error_message,
            }
        );
    }
};

exports.getTaxRuleDetails = async (req, res, next) => {
    try {
        const { tax } = req.params;
        let response = await service.findOne({ slug: tax, isDelete: false });
        helper.deliverResponse(res, 200, response, {
            error_code: messages.successResponse.error_code,
            error_message: messages.successResponse.error_message,
        });
    } catch (error) {
        helper.deliverResponse(
            res,
            422,
            {},
            {
                error_code: messages.serverError.error_code,
                error_message: messages.serverError.error_message,
            }
        );
    }
};

exports.update = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            helper.deliverResponse(res, 422, errors, {
                error_code: messages.VALIDATION_ERROR.error_code,
                error_message: messages.VALIDATION_ERROR.error_message,
            });
            return;
        }

        let { body } = req;

        //Name validation
        const existingRule = await service.findOne({ name: body.name, slug: { $ne: body?.slug }, isDelete: false });
        if (existingRule) {
            return helper.deliverResponse(res, 200, {}, messages.RULE_EXISTS);
        }

        const ruleDetails = await service.findOne({ slug: body?.slug });
        if (ruleDetails.name != body?.name) body.slug = await slug.createSlug(db.TaxRules, body.name, { slug: await slug.generateSlug(body.name) });
        let classDetails = await classService.find({ rules: { $in: [ruleDetails._id] }, isDelete: false });
        if (classDetails.length > 0 && (body?.isActive == "false" || body?.isActive == false)) {
            helper.deliverResponse(
                res,
                200,
                {},
                {
                    error_code: messages.ERROR_TAXRULE.error_code,
                    error_message: messages.ERROR_TAXRULE.error_message,
                }
            );
        } else {
            let response = await service.update({ _id: ruleDetails._id }, body);
            if (response instanceof Error) {
                helper.deliverResponse(
                    res,
                    422,
                    {},
                    {
                        error_code: messages.serverError.error_code,
                        error_message: messages.serverError.error_message,
                    }
                );
            } else {
                let classItems = await classService.find({ rules: { $in: [ruleDetails._id] }, isDelete: false });
                for (let classItem of classItems) {
                    let rate = 0;
                    for (let rule of classItem?.rules) rate += rule?.rate;
                    await classService.update({ _id: classItem?._id }, { rate: rate });
                }
                helper.deliverResponse(res, 200, response, {
                    error_code: messages.UPDATE_TAXRULE.error_code,
                    error_message: messages.UPDATE_TAXRULE.error_message,
                });
            }
        }
    } catch (error) {
        console.log("Error caught while update tax rule API :: " + error);
        helper.deliverResponse(
            res,
            422,
            {},
            {
                error_code: messages.serverError.error_code,
                error_message: messages.serverError.error_message,
            }
        );
    }
};

exports.delete = async (req, res) => {
    try {
        const { tax } = req.params;
        const ruleDetails = await service.findOne({ slug: tax });
        let classDetails = await classService.find({ rules: { $in: [ruleDetails._id] }, isDelete: false });
        if (classDetails.length > 0) {
            helper.deliverResponse(
                res,
                200,
                {},
                {
                    error_code: messages.RULE_DELETE_FAILED.error_code,
                    error_message: messages.RULE_DELETE_FAILED.error_message,
                }
            );
        } else {
            const response = await service.update({ _id: ruleDetails._id }, { isDelete: true });
            if (response instanceof Error) {
                helper.deliverResponse(res, 200, response, {
                    error_code: messages.serverError.error_code,
                    error_message: messages.serverError.error_message,
                });
            } else {
                helper.deliverResponse(res, 200, response, {
                    error_code: messages.RULE_DELETED.error_code,
                    error_message: messages.RULE_DELETED.error_message,
                });
            }
        }
    } catch (error) {
        console.log("Error caught while delete tax rule API :: " + error);
        helper.deliverResponse(
            res,
            422,
            {},
            {
                error_code: messages.serverError.error_code,
                error_message: messages.serverError.error_message,
            }
        );
    }
};
