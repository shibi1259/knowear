const db = require('../db')

exports.create = async (data) => {
   try {
      let general = new db.General(data);
      await general.save();
      return general;
   } catch (error) {
      throw error;
   }
}

exports.findOne = async (query, projection = {}) => {
   try {
      let general = await db.General.findOne(query, projection)
      return general
   } catch (error) {
      throw error
   }
}

exports.update = async (query, data) => {
   try {
      let general = await db.General.findOneAndUpdate(query, { $set: data }, {
         new: true,
         upsert: false,
         useFindAndModify: false
      }).exec();
      return general;
   } catch (error) {
      throw error;
   }
}