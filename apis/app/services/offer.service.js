const db = require('../db')

exports.create = async (objOffer) => {
  try {
    let response = new db.Offer(objOffer);
    await response.save();
    return response;
  } catch (error) {
    throw error;
  }
}

exports.find = async (obj, projection = {}) => {
  try {
    let response = await db.Offer.find(obj, projection)
    return response
  } catch (error) {
    throw error
  }
}

exports.search = async (query, page = 1, limit = 20, projection = {}, sort = { createdAt: -1 }) => {
  try {
    const [
      totalResults,
      offers
    ] = await Promise.all([
      db.Offer.find(query).countDocuments(),
      db.Offer.find(query, projection).limit(limit * 1).skip((page - 1) * limit).sort(sort)
    ])

    return {
      data: offers,
      totalResults: totalResults,
      page: page,
      limit: limit,
      totalPages: Math.ceil(totalResults / limit) == 0 ? 1 : Math.ceil(totalResults / limit),
      lastPage: (limit * page) > totalResults ? true : false,
    };
  } catch (error) {
    throw error;
  }
}

exports.findOne = async (query, projection = {}) => {
  try {
    let response = await db.Offer.findOne(query, projection)
    return response
  } catch (error) {
    throw error
  }
}

exports.update = async (query, data) => {
  try {
    let response = await db.Offer.findOneAndUpdate(query, { $set: data }, {
      new: true,
      upsert: false,
      useFindAndModify: false
    }).exec();
    return response;
  } catch (error) {
    throw error;
  }
}