const db = require('../db')

exports.createPageLimit = async (data) => {
   try {
      let limit = new db.Limits(data);
      await limit.save();
      return limit;
   } catch (error) {
      throw error;
   }
}

exports.getPageLimit = async (obj, projection = {}) => {
   try {
      let limit = await db.Limits.find(obj, projection)
         .populate('brands.selecteditem', 'name file isActive style slug')
         .populate('collections.selecteditem', 'name file isActive style slug')
         .populate('products.selecteditem', 'name isActive style slug thumbnail')
         .populate('categories.selecteditem', 'name file isActive style slug catid');
      return limit;
   } catch (error) {
      throw error;
   }
}

exports.getPageLimitCount = async (obj, projection = {}) => {
   try {
      let limit = await db.Limits.find(obj, projection).countDocuments();
      return limit;
   } catch (error) {
      throw error;
   }
}

exports.getCategoryPageLimitByKey = async (projection) => {
   try {
      let limit = await db.Limits.find({ isActive: true, isDelete: false }, projection)
         .populate('categories.selecteditem', '-_id name file style slug catid isFeatured');
      return limit;
   } catch (error) {
      throw error;
   }
}

exports.getBrandPageLimitByKey = async (projection) => {
   try {
      let limit = await db.Limits.find({ isActive: true, isDelete: false }, projection)
         .populate('brands.selecteditem', '-_id name file style slug brandid isFeatured');
      return limit;
   } catch (error) {
      throw error;
   }
}

exports.getCollectionPageLimitByKey = async (projection) => {
   try {
      let limit = await db.Limits.find({ isActive: true, isDelete: false }, projection)
         .populate('collections.selecteditem', '-_id name file style slug catid isFeatured');
      return limit;
   } catch (error) {
      throw error;
   }
}

exports.getPageLimitById = async (id) => {
   try {
      let limit = await db.Limits.find({ slug: id })
         .populate('brands.selecteditem', 'name file isActive style slug')
         .populate('collections.selecteditem', 'name file isActive style slug')
         .populate('products.selecteditem', 'name file isActive style slug')
         .populate('categories.selecteditem', 'name file isActive style slug catid');
      return limit;
   } catch (error) {
      throw error;
   }
}


exports.updateLimit = async (id, data) => {
   try {
      let limit = await db.Limits.findOneAndUpdate({ slug: id, isDelete: false, isActive: true }, { $set: data }, {
         new: true,
         upsert: false,
         useFindAndModify: false
      }).exec();
      return limit;
   } catch (error) {
      throw error;
   }
}
