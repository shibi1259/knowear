const db = require("../db");

exports.create = async (payload) => {
  try {
    let response = new db.Collection(payload);
    await response.save();
    return response;
  } catch (error) {
    throw error;
  }
};

exports.getCollection = async (query, projection = {}) => {
  try {
    let response = await db.CollectionLanding.findOne(query, projection).populate("collection").populate("products").populate("products2").populate("products3").populate("products4").populate("hotspots.productId");
    return response;
  } catch (error) {
    throw error;
  }
};

exports.updateCollection = async (query, obj) => {
  try {
    let response = await db.CollectionLanding.findOneAndUpdate(query, obj, { new: true })
    return response;
  } catch (error) {
    throw error;
  }
}

exports.createCollection = async (payload) => {
  try {
    let response = new db.CollectionLanding(payload);
    await response.save();
    return response;
  } catch (error) {
    throw error;
  }
}

exports.find = async (query, projection = {}) => {
  try {
    let response = await db.Collection
      .find(query, projection)
      .populate({ path: "products" });
    return response;
  } catch (error) {
    throw error;
  }
};

exports.findOne = async (query, projection = {}) => {
  try {
    let response = await db.Collection
      .findOne(query, projection)
      .populate({ path: "products" });
    return response;
  } catch (error) {
    throw error;
  }
};

exports.search = async (query, page, limit, projection = {}) => {
  try {
    let collections = await db.Collection.find(query, projection)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    let count = await db.Collection.find(query).countDocuments();
    return {
      data: collections,
      totalResults: count,
      page: page,
      limit: limit,
      totalPages: Math.ceil(count / limit) == 0 ? 1 : Math.ceil(count / limit),
      isLastPage: (limit * page) > count ? true : false,
    };
  } catch (error) {
    throw error;
  }
};

exports.update = async (query, payload) => {
  try {
    let collection = await db.Collection.findOneAndUpdate(query, { $set: payload }, {
      new: true,
      upsert: false,
      useFindAndModify: false,
    }).exec();
    return collection;
  } catch (error) {
    throw error;
  }
};

exports.getCollectionIds = async (query) => {
  try {
    const collections = await db.Collection.find().exec();
    return collections
  } catch (error) {
    throw error;
  }
}

exports.getCollectionBySlug = async (slug) => {
  try {
    const collection = await db.Collection.findOne({ slug: slug });
    return collection;
  } catch (error) {
    throw error;
  }
}