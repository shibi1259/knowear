const db = require("../db");

exports.create = async (data) => {
  try {
    let response = new db.TaxClass(data);
    await response.save();
    return response;
  } catch (error) {
    throw error;
  }
};

exports.findOne = async (query, projection = {}) => {
  try {
    let response = await db.TaxClass.findOne(query, projection).populate('rules');
    return response
  } catch (error) {
    throw error;
  }
}

exports.find = async (query, projection = {}) => {
  try {
    let response = await db.TaxClass.find(query, projection).populate('rules');
    return response
  } catch (error) {
    throw error;
  }
}

exports.getTaxClass = async (obj, projection = {}) => {
  try {
    let taxClass = await db.TaxClass.find(obj, projection)
      .populate(
        "rule",
        "_id name rate type isActive"
      );
    return taxClass;
  } catch (error) {
    throw error;
  }
};

exports.getTaxClassById = async (id) => {
  try {
    let taxClass = await db.TaxClass.findById(id).populate(
      "rule",
      "_id name rate type isActive"
    );;
    return taxClass;
  } catch (error) {
    throw error;
  }
};

exports.getTaxClassBySlug = async (slug) => {
  try {
    let taxClass = await db.TaxClass.find({ slug: slug }).populate(
      "rule",
      "_id name rate type isActive"
    );
    return taxClass;
  } catch (error) {
    throw error;
  }
};

exports.findTaxClass = async (query) => {
  try {
    let taxClass = await db.TaxClass.findOne(query);
    return taxClass;
  } catch (error) {
    throw error;
  }
};

exports.getTaxRulesName = async () => {
  try {
    let taxRules = await db.TaxRules.find({}, { name: 1, rate: 1 });
    return taxRules;
  } catch (error) {
    throw error;
  }
};

exports.search = async (query, page, limit, projection = {}) => {
  try {
    let response = await db.TaxClass.find(query, projection).limit(limit * 1).skip((page - 1) * limit).sort({ createdAt: -1 })
      .populate('rules', 'name rate -_id');
    let count = await db.TaxClass.find(query).countDocuments()
    let result = {
      data: response,
      totalResults: count,
      page: page,
      items_per_page: limit,
      totalPages: Math.ceil(count / limit),
      isLastPage: (limit * page) > count ? true : false,
    }
    return result;
  } catch (error) {
    throw error;
  }
}

exports.update = async (query, data) => {
  try {
    let response = await db.TaxClass.findOneAndUpdate(query, { $set: data }, {
      new: true,
      upsert: false,
      useFindAndModify: false,
    }).exec();
    return response;
  } catch (error) {
    throw error;
  }
};
