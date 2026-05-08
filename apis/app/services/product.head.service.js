const db = require("../db");

exports.add = async (obj) => {
   try {
      let product = new db.ProductHead(obj);
      await product.save();
      return product;
   } catch (error) {
      throw error;
   }
};

exports.find = async (query, projection = {}) => {
   try {
      let product = await db.ProductHead.find(query, projection)
      return product;
   } catch (error) {
      throw error
   }
}

exports.findOne = async (query, projection = {}) => {
   try {
      let product = await db.ProductHead.findOne(query, projection)
         .populate('tax')
      return product;
   } catch (error) {
      throw error
   }
}

exports.count = async (query, projection = {}) => {
   try {
      let product = await db.ProductHead.find(query, projection).countDocuments()
      return product;
   } catch (error) {
      throw error
   }
}

exports.search = async (query, page, limit, projection = {},) => {
   try {
      let count = await db.ProductHead.find(query, projection).countDocuments()
      let products = await db.ProductHead.find(query, projection)
         .limit(limit * 1)
         .skip((page - 1) * limit)
         .sort({ createdAt: -1 })
         .populate('tax')
      const data = {
         data: products,
         page: page,
         limit: limit,
         lastPage: (limit * page) >= count ? true : false,
         totalPages: Math.ceil(count / limit) == 0 ? 1 : Math.ceil(count / limit),
         totalItems: count
      }
      return data
   } catch (error) {
      throw error
   }
}

exports.update = async (query, data) => {
   try {
      let product = await db.ProductHead.findOneAndUpdate(query, { $set: data }, {
         new: true,
         upsert: false,
         useFindAndModify: false,
      }).exec();
      return product;
   } catch (error) {
      throw error;
   }
};

