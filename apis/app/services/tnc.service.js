const db = require('../db')

exports.createTnc = async (objTnc) => {
    try {
        let tnc = new db.Tnc(objTnc)
        await tnc.save()
        return tnc;
    } catch (error) {
        throw (error)
    }
}

exports.getTnc = async (obj, projection = {}) => {
    try {
        let tnc = db.Tnc.findOne(obj, projection)
        return tnc;
    } catch (error) {
        throw (error)
    }
}

exports.getAllTnc = async () => {
    try {
        let tnc = db.Tnc.find({ isDelete: false })
        return tnc;
    } catch (error) {
        throw (error)
    }
}

exports.updateTnc = async (slug, objTnc) => {
    try {
        let tnc = await db.Tnc.findOneAndUpdate({ slug: slug }, { $set: objTnc }, {
            new: true,
            upsert: false,
            useFindAndModify: false
        }).exec();
        return tnc
    } catch (error) {
        throw (error)
    }
}