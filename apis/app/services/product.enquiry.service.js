const db = require("../db");

exports.create = async (data) => {
  try {
    let response = new db.ProductEnquiry(data);
    await response.save();
    return response;
  } catch (error) {
    throw error;
  }
};

exports.find = async (obj, projection = {}) => {
  try {
    let response = db.ProductEnquiry.find(obj, projection);
    return response;
  } catch (error) {
    throw error;
  }
};

exports.search = async (
  query,
  page = 1,
  limit = 20,
  projection = {},
  sort = { createdAt: -1 }
) => {
  try {
    let response = await db.ProductEnquiry.find(query, projection)
      .populate('product')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(sort);
    let count = await db.ProductEnquiry.find(query).countDocuments();
    let result = {
      totalResults: count,
      totalPages: Math.ceil(count / limit) == 0 ? 1 : Math.ceil(count / limit),
      page: page,
      limit: limit,
      data: response,
      isLastPage: limit * page >= count ? true : false,
    };
    return result;
  } catch (error) {
    throw error;
  }
};

exports.findOne = async (query, projection = {}) => {
  try {
    let response = db.ProductEnquiry.findOne(query, projection).populate('product');
    return response;
  } catch (error) {
    throw error;
  }
};

exports.update = async (query, data) => {
  try {
    let response = await db.ProductEnquiry.updateOne(
      query,
      { $set: data },
      {
        new: true,
        upsert: false,
        useFindAndModify: false,
      }
    ).exec();
    return response;
  } catch (error) {
    throw error;
  }
};
