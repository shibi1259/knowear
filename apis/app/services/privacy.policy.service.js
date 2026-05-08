const db = require('../db')

exports.createPrivacyPolicy = async (objPrivacyPolicy) => {
    try {
        let privacypolicy = new db.PrivacyPolicy(objPrivacyPolicy)
        await privacypolicy.save()
        return privacypolicy;
    } catch (error) {
        throw (error)
    }
}

exports.getPrivacyPolicy = async (obj, projection = {}) => {
    try {
        let privacypolicy = db.PrivacyPolicy.findOne(obj, projection)
        return privacypolicy;
    } catch (error) {
        throw (error)
    }
}

exports.getAllPrivacyPolicy = async () => {
    try {
        let privacypolicy = db.PrivacyPolicy.find({ isDelete: false })
        return privacypolicy;
    } catch (error) {
        throw (error)
    }
}

exports.updatePrivacyPolicy = async (slug, objPrivacyPolicy) => {
    try {
        let privacypolicy = await db.PrivacyPolicy.findOneAndUpdate({ slug: slug }, { $set: objPrivacyPolicy }, {
            new: true,
            upsert: false,
            useFindAndModify: false
        }).exec();
        return privacypolicy
    } catch (error) {
        throw (error)
    }
}