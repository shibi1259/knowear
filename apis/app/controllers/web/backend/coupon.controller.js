const service = require("../../../services/coupon.service");
const helper = require("../../../../util/responseHelper");
const messages = require("../../../../config/constants").messages;
const slug = require("../../../../util/slug");
const db = require("../../../db");
const { body, validationResult } = require("express-validator");
const slugify = require("slugify");
const fs = require("fs");
const convertFile = require("../../../../util/base64tofile");
const collection_service = require("../../../services/collection.service");
const productService = require("../../../services/product.service");
const { log } = require("winston");
const activity = require("../../../../util/activity.creator")

exports.validate = (method) => {
  switch (method) {
    case "create": {
      return [
        body("title", `title is required`).exists(),
        body("code", `code is required`).exists(),
        body("type", `Type is required`).exists(),
        body("value", `Value is required`).exists(),
      ];
    }
    case "update": {
      return [
        body("refid", `Refid is required`).exists(),
      ];
    }
    case "search": {
      return [
        body("page", `Page is required`).exists(),
        body("limit", `Limit is required`).exists(),
      ];
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

    const { body } = req;
    body.refid = await service.getCouponCount({}) + 1
    body.slug = await slug.createSlug(db.Coupon, body?.title, { slug: await slug.generateSlug(body?.title) })

    if (body?.filestring && body.filename) {
      const filepath = await convertFile(body.filestring, body.filename, "coupons")
      body.file = "uploads" + filepath
    }

    const coupon = await service.createCoupon(body)
    if (coupon instanceof Error) {
      helper.deliverResponse(res, 200, {}, {
        "error_code": messages.serverError.error_code,
        "error_message": messages.serverError.error_message
      });
    } else {
      helper.deliverResponse(res, 200, coupon, {
        "error_code": messages.COUPON_ADD.error_code,
        "error_message": messages.COUPON_ADD.error_message
      });
    }
  } catch (error) {
    console.log(error, ' :: Error caught while creating coupon');
    helper.deliverResponse(res, 422, {}, {
      "error_code": messages.serverError.error_code,
      "error_message": messages.serverError.error_message
    });
  }
};

exports.getCoupons = async (req, res) => {
  try {
    const coupons = await service.getCoupons({ isDelete: false });
    helper.deliverResponse(res, 200, coupons, {
      error_code: messages.successResponse.error_code,
      error_message: messages.successResponse.error_message,
    });
  } catch (error) {
    helper.deliverResponse(res, 422, {}, {
      error_code: messages.serverError.error_code,
      error_message: messages.serverError.error_message,
    });
  }
};

exports.getActiveCoupons = async (req, res) => {
  try {
    const coupons = await service.getCoupons({ isActive: true, isDelete: false });
    helper.deliverResponse(res, 200, coupons, {
      error_code: messages.successResponse.error_code,
      error_message: messages.successResponse.error_message,
    });
  } catch (error) {
    helper.deliverResponse(res, 422, {}, {
      error_code: messages.serverError.error_code,
      error_message: messages.serverError.error_message,
    });
  }
};

exports.getCouponDetails = async (req, res) => {
  try {
    const { body } = req
    const couponDetails = await service.getCouponDetails({ refid: body?.refid, isDelete: false });
    helper.deliverResponse(res, 200, couponDetails, {
      error_code: messages.successResponse.error_code,
      error_message: messages.successResponse.error_message,
    });
  } catch (error) {
    helper.deliverResponse(res, 422, {}, {
      error_code: messages.serverError.error_code,
      error_message: messages.serverError.error_message,
    });
  }
};

exports.getProductCoupons = async (req, res) => {
  try {
    const { body } = req
    const coupons = await service.getCoupons({ refid: body?.refid, isDelete: false });
    helper.deliverResponse(res, 200, coupons, {
      error_code: messages.successResponse.error_code,
      error_message: messages.successResponse.error_message,
    });
  } catch (error) {
    helper.deliverResponse(res, 422, {}, {
      error_code: messages.serverError.error_code,
      error_message: messages.serverError.error_message,
    });
  }
};

exports.getCouponBySearch = async (req, res, next) => {
  try {
    const { body } = req;
    let data = { isDelete: false };
    if (body?.title) data['$or'] = [{ title: { $regex: body?.title, $options: 'i' } }, { code: { $regex: body?.title, $options: 'i' } }]
    if (body?.isActive) data['isActive'] = body?.isActive
    
    if (body?.fromDate && body?.toDate) {
      const fromDate = new Date(body.fromDate);
      const toDate = new Date(body.toDate);
      data['$and'] = [
        { lastDate: { $gte: fromDate } }, // Coupons ending on or after the given fromDate
        { fromDate: { $lte: toDate } }   // Coupons starting on or before the given toDate
      ];
    } else {
      if (body?.fromDate) {
        const fromDate = new Date(body.fromDate);
        data['lastDate'] = { $gte: fromDate };
      }
      if (body?.toDate) {
        const toDate = new Date(body.toDate);
        data['fromDate'] = { $lte: toDate };
      }
    }

    const response = await service.searchCoupons(data, body?.page, body?.limit, {}, { createdAt: -1 });
    helper.deliverResponse(res, 200, response, {
      error_code: messages.successResponse.error_code,
      error_message: messages.successResponse.error_message,
    });
  } catch (error) {
    console.log('Error caugh while searching coupon :: ' + error);
    helper.deliverResponse(res, 422, {}, {
      error_code: messages.serverError.error_code,
      error_message: messages.serverError.error_message,
    });
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

    const { body } = req;
    const couponDetails = await service.getCouponDetails({ refid: body?.refid, isDelete: false });
    body?.title ?
      body?.title == couponDetails?.title ? null : body.slug = await slug.createSlug(db.Coupon, body?.title, { slug: await slug.generateSlug(body?.title) }) : null
    const updatedCoupon = await service.updateCoupon({ refid: body?.refid, isDelete: false }, body)
    if (updatedCoupon instanceof Error) {
      helper.deliverResponse(res, 422, updatedCoupon, {
        "error_code": messages.serverError.error_code,
        "error_message": messages.serverError.error_message
      });
    } else {
      activity.logActivity(res?.locals?.user?.email, `Coupon ${couponDetails.code} updated successfully`)
      helper.deliverResponse(res, 200, updatedCoupon, {
        "error_code": messages.COUPON_UPDATE.error_code,
        "error_message": messages.COUPON_UPDATE.error_message
      });
    }
  } catch (error) {
    console.error('Error caught in update coupon API :: ' + error);
    helper.deliverResponse(res, 422, {}, {
      "error_code": messages.serverError.error_code,
      "error_message": messages.serverError.error_message
    });
  }
};