const db = require("../db")
const config = require("../../config/constants/index")
const base_url = config.common.BASE_URL
const theme = require("../../config/constants/index").themeSettings

exports.createBanner = async (objBanner) => {
    try {
        let banner = new db.HomeBanner(objBanner)
        await banner.save();
        return banner;
    } catch (error) {
        throw (error)
    }
}

exports.getAllBanner = async () => {
    try {
        let banner = await db.HomeBanner.find({ isDelete: false })
        return banner
    } catch (error) {
        throw (error)
    }
}

exports.getBannersByPage = async (query, page, limit, projection = {}) => {
    try {
        let banners = await db.HomeBanner.find(query, projection).limit(limit * 1).skip((page - 1) * limit)
        let count = await db.HomeBanner.find(query).countDocuments()
        let result = {
            data: banners,
            total_item: count,
            page: page,
            items_per_page: limit,
            totalPages: Math.ceil(count / limit),
            lastPage: (limit * page) > count ? true : false,
        }
        return result
    } catch (error) {
        throw (error)
    }
}

exports.getBannersCount = async (query) => {
    try {
        let banner = await db.HomeBanner.find(query).countDocuments()
        return banner
    } catch (error) {
        throw (error)
    }
}

exports.getBanner = async (obj, projection = {}) => {
    try {
        let banner = await db.HomeBanner.find(obj, projection)
        return banner;
    } catch (error) {
        throw (error)
    }
}

exports.getBannerDetails = async (obj, projection = {}) => {
    try {
        let banner = await db.HomeBanner.findOne(obj, projection)
        return banner;
    } catch (error) {
        throw (error)
    }
}

exports.getBannerBySlug = async (slug) => {
    try {
        let banner = await db.HomeBanner.find({ bannerid: slug })
        return banner
    } catch (error) {
        throw error
    }
}

exports.updateBanner = async (slug, objBanner) => {
    try {
        let banner = await db.HomeBanner.findOneAndUpdate({ bannerid: slug }, { $set: objBanner }, {
            new: true,
            upsert: false,
            useFindAndModify: false
        }).exec();
        return banner;
    } catch (error) {
        throw (error)
    }
}

exports.bannerForWebDashboard = async (query) => {
    try {
        const projection = { position: 0, isActive: 0, isDelete: 0, _id: 0, updatedAt: 0, createdAt: 0, __v: 0 }
        let banners = await db.HomeBanner.find(query, projection)
        let data = []
        for (let banner of banners) {
            let files = []
            for (let file of banner?.files) {
                files.push({
                    file: base_url + file?.file,
                    mobileFile: file?.mobileFile ? base_url + file?.mobileFile : null,
                    url: file?.redirection,
                    title: file?.title
                })
            }
            data.push({ type: 'banner-' + banner.type, banner_items: files, refid: banner?.bannerid })
        }
        return data;
    } catch (error) {
        throw error;
    }
}