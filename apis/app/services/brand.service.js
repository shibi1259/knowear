const db = require('../db')
const config = require("../../config/constants/index")
const { BASE_URL } = require('../../config/constants/common')
const base_url = config.common.BASE_URL
const theme = require("../../config/constants/index").themeSettings
const settingsService = require('./general.settings.service')

exports.create = async (objBrand) => {
    try {
        let brand = new db.Brand(objBrand);
        await brand.save();
        return brand;
    } catch (error) {
        throw error;
    }
}

exports.aggregate = async (query) => {
    try {
        let brands = await db.Brand.aggregate(query);
        return brands;
    } catch (error) {
        throw error;
    }
}

exports.pagination = async (page, limit) => {
    try {
        let brand = await db.Brand.find({ isDelete: false }).limit(limit * 1).skip((page - 1) * limit).populate([
            { path: 'thumbnail', match: { _id: { $exists: true } } },
            { path: 'cover', match: { _id: { $exists: true } } }
        ]);
        return brand;
    } catch (error) {
        throw error;
    }
}

exports.getBrandByPageAndQuery = async (query, page, limit, projection = {}, sort = { createdAt: -1 }) => {
    try {
        let brand = await db.Brand.find(query, projection).limit(limit * 1).skip((page - 1) * limit).sort(sort).populate([
            { path: 'thumbnail', match: { _id: { $exists: true } } },
            { path: 'cover', match: { _id: { $exists: true } } }
        ]);
        return brand;
    } catch (error) {
        throw error;
    }
}

exports.getBrands = async (query, sort) => {
    try {
        let brand = await db.Brand.find(query).populate([
            { path: 'thumbnail', match: { _id: { $exists: true } } },
            { path: 'cover', match: { _id: { $exists: true } } }
        ]).sort(sort)
        return brand;
    } catch (error) {
        throw error;
    }
}

exports.getBrand = async (query) => {
    try {
        let brand = await db.Brand.findOne(query).populate([
            { path: 'thumbnail', match: { _id: { $exists: true } } },
            { path: 'cover', match: { _id: { $exists: true } } }
        ])
        return brand;
    } catch (error) {
        throw error;
    }
}

exports.getBrandBySearch = async (query, page, limit, projection = {}) => {
    try {
        let brands = await db.Brand.find(query, projection).limit(limit * 1).skip((page - 1) * limit).sort({ createdAt: -1 }).populate([
            { path: 'thumbnail', match: { _id: { $exists: true } } },
            { path: 'cover', match: { _id: { $exists: true } } }
        ]);
        let count = await db.Brand.find(query).countDocuments()
        let result = {
            data: brands,
            totalResults: count,
            page: page,
            limit: limit,
            totalPages: Math.ceil(count / limit) == 0 ? 1 : Math.ceil(count / limit),
            isLastPage: (limit * page) > count ? true : false,
        }
        return result;
    } catch (error) {
        throw error;
    }
}

exports.count = async (query) => {
    try {
        let brand = await db.Brand.find(query).countDocuments();
        return brand;
    } catch (error) {
        throw error;
    }
}

exports.getBrandById = async (id) => {
    try {
        let brand = await db.Brand.findById(id).populate([
            { path: 'thumbnail', match: { _id: { $exists: true } } },
            { path: 'cover', match: { _id: { $exists: true } } }
        ]);
        return brand;
    } catch (error) {
        throw error;
    }
}

exports.findOne = async (query, projection = {}) => {
    try {
        let response = await db.Brand.findOne(query, projection).populate([
            { path: 'thumbnail', match: { _id: { $exists: true } } },
            { path: 'cover', match: { _id: { $exists: true } } }
        ]);
        return response;
    } catch (error) {
        throw error;
    }
}

exports.getBrandByBrandId = async (id) => {
    try {
        let brand = await db.Brand.find({ brandid: id });
        return brand;
    } catch (error) {
        throw error;
    }
}

exports.updateOne = async (query, data) => {
    try {
        let brand = await db.Brand.updateOne(query, { $set: data }, {
            new: true,
            upsert: false,
            useFindAndModify: false
        }).exec();
        return brand;
    } catch (error) {
        throw error;
    }
}

exports.updateBrand = async (slug, objBrand) => {
    try {
        let brand = await db.Brand.findOneAndUpdate({ brandid: slug }, { $set: objBrand }, {
            new: true,
            upsert: false,
            useFindAndModify: false
        }).exec();
        return brand;
    } catch (error) {
        throw error;
    }
}

//Web and App APIs
exports.getBrandsByPage = async (query, page, limit) => {
    try {
        const projection = { isArchive: 0, isFeatured: 0, isActive: 0, isDelete: 0, selected: 0, _id: 0, updatedAt: 0, createdAt: 0, __v: 0 }
        let response = []
        let brands = await db.Brand.find(query, projection).limit(limit * 1).skip((page - 1) * limit);
        let count = await db.Brand.find(query).countDocuments()
        let last_page = false
        for (let brand of brands) {
            response.push({
                id: response.length,
                text: {
                    text: brand?.name,
                    'font-size': brand['style']['text']['fontSize'],
                    fontSize: brand['style']['text']['fontSize'],
                    fontWeight: brand['style']['text']['fontWeight'],
                    'font-weight': 5,
                    color: "0xff" + brand['style']['text']['color'].split('#')[1],
                },
                style: {
                    background: "0xff" + brand['style']['background'].split('#')[1],
                    border: "0xff" + brand['style']['border'].split('#')[1],
                    radius: brand['style']['radius']
                },
                params: { brandid: brand?.brandid },
                image: BASE_URL + brand?.thumbnail?.path,
                viewtype: "image-text",
            })
        }
        if (count <= page * limit) {
            last_page = true
        }
        let result = {
            title: { text: 'Brands' },
            brand_items: response,
            total_item: count,
            page: Number(page),
            items_per_page: limit,
            last_page: last_page
        }
        return result;
    } catch (error) {
        throw error;
    }
}

exports.getBrandsByPageWeb = async (query, page, limit) => {
    try {
        const projection = { isArchive: 0, isFeatured: 0, isActive: 0, isDelete: 0, selected: 0, _id: 0, updatedAt: 0, createdAt: 0, __v: 0 }
        let response = []
        let brands = await db.Brand.find(query, projection).limit(limit * 1).skip((page - 1) * limit);
        let count = await db.Brand.find(query).countDocuments()
        let last_page = false
        for (let brand of brands) {
            response.push({
                id: response.length,
                text: {
                    text: brand?.name,
                    'font-size': brand['style']['text']['fontSize'],
                    fontSize: brand['style']['text']['fontSize'],
                    fontWeight: brand['style']['text']['fontWeight'],
                    'font-weight': 5,
                    color: brand['style']['text']['color'],
                },
                style: {
                    background: brand['style']['background'],
                    border: brand['style']['border'],
                    radius: brand['style']['radius']
                },
                params: { brandid: brand?.brandid },
                image: BASE_URL + brand?.thumbnail?.path,
            })
        }
        if (count <= page * limit) last_page = true
        let result = {
            brand_items: response,
            total_items: String(count),
            page: page,
            items_per_page: limit,
            last_page: last_page
        }
        return result;
    } catch (error) {
        throw error;
    }
}

//Dashboard brand
exports.brandForDashboard = async (query, page, limit) => {
    try {
        const projection = { isActive: 0, isDelete: 0, selected: 0, _id: 0, updatedAt: 0, createdAt: 0, __v: 0, isFeatured: 0, slug: 0 }
        let brand = await db.Brand.find(query, projection).limit(limit * 1).skip((page - 1) * limit);
        const settings = await settingsService.findOne({ refid: '100' })
        let data = []
        for (let i = 0; i < brand.length; i++) {
            data.push({
                id: String(i),
                viewtype: "image-text",
                image: base_url + brand[i].thumbnail?.path,
                params: {
                    brandid: brand[i]['brandid'],
                    slug: brand[i]['slug'],
                },
                text: {
                    text: brand[i]['name'],
                    'font-size': brand[i]['style']['text']['fontSize'],
                    color: "0xff" + brand[i]['style']['text']['color'].split('#')[1],
                },
                style: {
                    background: "0xff" + brand[i]['style']['background'].split('#')[1],
                    border: "0xff" + brand[i]['style']['border'].split('#')[1],
                    radius: brand[i]['style']['radius']
                }
            })
        }
        const result = {
            type: "brand",
            brand_items: data,
            title: {
                text: theme.labels.BRAND,
                color: settings?.colors?.text,
                "font-weight": theme.fonts.FONT_BOLD
            },
            button: {
                label: {
                    text: theme.buttons.VIEW_BUTTON,
                    color: settings?.colors?.primary,
                    "font-style": theme.fonts.FONT_STYLE,
                    "font-size": theme.fonts.BUTTON_FONT_SIZE,
                    "font-weight": theme.fonts.FONT_WEIGHT
                },
                bgcolor: [
                    settings?.colors?.primary,
                ],
                type: 1,
            },
            Displaystatus: true
        }
        return result;
    } catch (error) {
        throw error;
    }
}

exports.updateBrandById = async (body, obj) => {
    try {
        let brand = await db.Brand.findOneAndUpdate(body, { $set: obj }, {
            new: true,
            upsert: false,
            useFindAndModify: false
        }).exec();
        return brand;
    } catch (error) {
        throw error;
    }
}

exports.updateBulk = async (body, obj) => {
    try {
        let brand = await db.Brand.findOneAndUpdate(body, { $set: obj }, {
            new: true,
            upsert: false,
            useFindAndModify: false
        }).exec();
        return brand;
    } catch (error) {
        throw error;
    }
}