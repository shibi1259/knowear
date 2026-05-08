const db = require('../db')

exports.createHomeSettingsSettings = async (data) => {
   try {
      let HomeSettings = new db.HomeSettings(data);
      await HomeSettings.save();
      return HomeSettings;
   } catch (error) {
      throw error;
   }
}

exports.getSettings = async (query, projection = {}) => {
   try {
      let HomeSettings = await db.HomeSettings.find(query, projection)
      return HomeSettings
   } catch (error) {
      throw error
   }
}

exports.getSettingsCount = async (query, projection = {}) => {
   try {
      let HomeSettings = await db.HomeSettings.find(query, projection).countDocuments()
      return HomeSettings
   } catch (error) {
      throw error
   }
}

exports.updateHomeSettings = async (id, data) => {
   try {
      let HomeSettings = await db.HomeSettings.findOneAndUpdate({ refid: id, isDelete: false, isActive: true }, { $set: data }, {
         new: true,
         upsert: false,
         useFindAndModify: false
      }).exec();
      return HomeSettings;
   } catch (error) {
      throw error;
   }
}

//Web and App APIs
exports.getHomeSettings = async (query) => {
   try {
      const projection = {}
      let HomeSettings = await db.HomeSettings.find(query, projection)
      return HomeSettings
   } catch (error) {
      throw error
   }
}