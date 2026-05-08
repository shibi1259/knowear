const db = require('../db')

// Cache settings for 2 minutes to avoid repeated DB hits on every request
let _settingsCache = null;
let _settingsCacheTs = 0;
const SETTINGS_CACHE_TTL = 2 * 60 * 1000; // 2 minutes

exports.create = async (data) => {
   try {
      let general = new db.General(data);
      await general.save();
      _settingsCache = null; // Invalidate cache on create
      return general;
   } catch (error) {
      throw error;
   }
}

exports.findOne = async (query = {}, projection = {}) => {
   try {
      // Use cache for the common no-filter query (used everywhere for currency/settings)
      const isSimpleQuery = Object.keys(query).length === 0 && Object.keys(projection).length === 0;
      if (isSimpleQuery && _settingsCache && (Date.now() - _settingsCacheTs) < SETTINGS_CACHE_TTL) {
         return _settingsCache;
      }
      let general = await db.General.findOne(query, projection);
      if (isSimpleQuery) {
         _settingsCache = general;
         _settingsCacheTs = Date.now();
      }
      return general;
   } catch (error) {
      throw error;
   }
}

exports.update = async (query, data) => {
   try {
      let general = await db.General.findOneAndUpdate(query, { $set: data }, {
         new: true,
         upsert: false,
         useFindAndModify: false
      }).exec();
      _settingsCache = null; // Invalidate cache on update
      return general;
   } catch (error) {
      throw error;
   }
}
