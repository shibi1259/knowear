const db = require('../db');

exports.getAboutDetails = async (query) => {
    try {
        const aboutDetails = await db.About.findOne(query);
        return aboutDetails;
    } catch (error) {
        return error;
    }
};
// exports.getAboutUs

exports.createAbout = async (data) => {
    try {
        data.refid = 'about-us';
        const about = new db.About(data);
        await about.save();
        return about;
    } catch (error) {
        return error;
    }
};

exports.updateAbout = async (query, data) => {
    try {
        data.updatedAt = Date.now();
        const about = await db.About.findOneAndUpdate(query, data, { new: true });
        return about;
    } catch (error) {
        return error;
    }
};