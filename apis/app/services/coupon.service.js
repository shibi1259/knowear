const { BASE_URL } = require("../../config/constants/common");
const db = require("../db");

exports.createCoupon = async (objCoupon) => {
  try {
    let coupon = new db.Coupon(objCoupon);
    await coupon.save();
    return coupon;
  } catch (error) {
    throw error;
  }
};

exports.getCoupons = async (query, projection = {}) => {
  try {
    let coupon = await db.Coupon.find(query, projection);
    return coupon;
  } catch (error) {
    throw error;
  }
};

exports.getCouponDetails = async (query, projection = {}) => {
  try {
    let coupon = await db.Coupon.findOne(query, projection);
    return coupon;
  } catch (error) {
    throw error;
  }
};

exports.getCouponDetailsWithProducts = async (query, projection = {}) => {
  try {
    let coupon = await db.Coupon.findOne(query, projection).populate({
      path: 'products', // Field to populate
      model: 'products', // Ensure this matches the model name used in your database
      select: 'name price category', // Fields to include from the populated products
    });
;
    return coupon;
  } catch (error) {
    throw error;
  }
};

exports.getCouponCount = async (query) => {
  try {
    let coupon = await db.Coupon.findOne(query).countDocuments();
    return coupon;
  } catch (error) {
    throw error;
  }
};

exports.searchCoupons = async (query, page, limit, projection = {}, sort = {}) => {
  try {
    let coupons = await db.Coupon.find(query, projection).limit(limit * 1).skip((page - 1) * limit).sort(sort);
    let count = await db.Coupon.find(query).countDocuments()
    const settings = await db.General.findOne({ refid: '1', isDelete: false })
    let couponData = []
    for (let coupon of coupons) {
      let message = null
      if (coupon?.type == 'percent') message = `Get ${coupon?.value} % off`
      if (coupon?.type == 'amount') message = `Get flat ${settings?.currency} ${coupon?.value} off`
      couponData.push({
        title: coupon?.title,
        refid: coupon?.refid,
        code: coupon?.code,
        slug: coupon?.slug,
        isActive: coupon?.isActive,
        message: message,
        type: coupon?.details?.type == 'limited' ? `There is only ${coupon.details?.value} coupons available in total` : null,
        file: coupon?.file ? BASE_URL + coupon?.file : null,
        isCompleted: new Date(coupon?.lastDate) < new Date(new Date().setHours(0, 0, 0, 0)) ? true : false,
      })
    }

    let result = {
      data: couponData,
      totalResults: count,
      page: page,
      items_per_page: limit,
      totalPages: Math.ceil(count / limit),
      lastPage: (limit * page) > count ? true : false,
    }
    return result;
  } catch (error) {
    throw error;
  }
};

exports.updateCoupon = async (query, data) => {
  try {
    let coupon = await db.Coupon.findOneAndUpdate(
      query,
      { $set: data },
      { new: true, upsert: false, useFindAndModify: false }
    ).exec();
    return coupon;
  } catch (error) {
    throw error;
  }
};




