const db = require('../db')
const config = require("../../config/constants/index")
const { result } = require('express-validator')
const base_url = config.common.BASE_URL
const theme = require("../../config/constants/index").themeSettings
const settingsService = require('./general.settings.service')

exports.create = async (objCategory) => {
    try {
        let response = new db.Category(objCategory);
        await response.save();
        return response;
    } catch (error) {
        throw error;
    }
}

exports.createCategoryLanding = async (objCategoryLanding) => {
    try {
        let response = await db.CategoryLanding.create(objCategoryLanding);
        return response;
    } catch (error) {
        throw error;
    }
}

exports.updateCategoryLanding = async (query, obj) => {
    try {
        let response = await db.CategoryLanding.findOneAndUpdate(query, obj, { new: true })
        return response;
    } catch (error) {
        throw error;
    }
}   
exports.getCategoryLanding = async (query, projection = {}) => {
    try {
        let response = await db.CategoryLanding.findOne(query, projection).populate("products").populate("products2").populate("products3").populate("products4").populate("hotspots.productId").populate("category").populate('subCategories')
        return response;
    } catch (error) {
        throw error;
    }
}

exports.findOne = async (query, projection = {}) => {
    try {
        let response = await db.Category.findOne(query, projection).populate([{ path: 'parent', match: { _id: { $exists: true } } }]);
        return response;
    } catch (error) {
        throw error;
    }
}
exports.getSubCategoriesById = async (categoryId) => {
    try {
        let category = await db.Category.find({ "parent": categoryId })
        return category;
    } catch (error) {
        throw error;
    }
}

exports.getSingleCategory = async (query, projection = {}) => {
    try {
        let category = await db.Category.findOne(query, projection)
        return category
    } catch (error) {
        throw error;
    }
}

exports.getCategory = async (obj, projection = {}, sort = {}) => {
    try {
        let category = await db.Category.find(obj, projection).sort({ name: 1 })
            .populate({
                path: 'root',
                select: " name file slug",
                populate: {
                    path: 'root',
                    select: ' name slug file',
                    populate: {
                        path: 'root'
                    }
                }
            })
            .populate({
                path: 'parent.refid',
                select: "name file slug",
                populate: {
                    path: 'root',
                    populate: {
                        path: 'root',
                        select: "-_id name file slug",
                    }
                }
            })
            .populate({
                path: 'parent.refid',
                select: "name file slug",
                populate: {
                    path: 'parent.refid',
                    select: "name file slug",
                    populate: {
                        path: 'parent.refid',
                        select: "-_id name file slug",
                    }
                }
            })
            .populate({
                path: 'parent.refid',
                select: "name file slug",
                populate: {
                    path: 'root',
                    select: "name file slug",
                    populate: {
                        path: 'parent.refid',
                        select: "-_id name file slug",
                    }
                }
            })

        return category;
    } catch (error) {
        throw error;
    }
}

exports.getCategoryByPage = async (page, limit) => {
    try {
        let category = await db.Category.find({ isDelete: false }).limit(limit * 1).skip((page - 1) * limit)
            .populate({
                path: 'root',
                select: " name file slug",
                populate: {
                    path: 'root',
                    select: ' name slug file',
                    populate: {
                        path: 'root'
                    }
                }
            })
            .populate({
                path: 'parent.refid',
                select: "name file slug",
                populate: {
                    path: 'root',
                    populate: {
                        path: 'root',
                        select: "-_id name file slug",
                    }
                }
            })
            .populate({
                path: 'parent.refid',
                select: "name file slug",
                populate: {
                    path: 'parent.refid',
                    select: "name file slug",
                    populate: {
                        path: 'parent.refid',
                        select: "-_id name file slug",
                    }
                }
            })
            .populate({
                path: 'parent.refid',
                select: "name file slug",
                populate: {
                    path: 'root',
                    select: "name file slug",
                    populate: {
                        path: 'parent.refid',
                        select: "-_id name file slug",
                    }
                }
            })
        return category;
    } catch (error) {
        throw error;
    }
}

exports.getCategoryBySlug = async (slug) => {
    try {
        let category = await db.Category.find({ slug: slug })
            .populate({
                path: 'root',
                select: " name file slug",
                populate: {
                    path: 'root',
                    select: ' name slug file',
                    populate: {
                        path: 'root'
                    }
                }
            })
            .populate({
                path: 'parent.refid',
                select: "name file slug",
                populate: {
                    path: 'root',
                    populate: {
                        path: 'root',
                        select: "-_id name file slug",
                    }
                }
            })
            .populate({
                path: 'parent.refid',
                select: "name file slug",
                populate: {
                    path: 'parent.refid',
                    select: "name file slug",
                    populate: {
                        path: 'parent.refid',
                        select: "-_id name file slug",
                    }
                }
            })
            .populate({
                path: 'parent.refid',
                select: "name file slug",
                populate: {
                    path: 'root',
                    select: "name file slug",
                    populate: {
                        path: 'parent.refid',
                        select: "-_id name file slug",
                    }
                }
            })
        return category;
    } catch (error) {
        throw error;
    }
}

exports.getCategoryById = async (id) => {
    try {
        let category = await db.Category.findById(id)
            .populate({
                path: 'root',
                select: " name file slug",
                populate: {
                    path: 'root',
                    select: ' name slug file',
                    populate: {
                        path: 'root'
                    }
                }
            })
            .populate({
                path: 'parent.refid',
                select: "name file slug",
                populate: {
                    path: 'root',
                    populate: {
                        path: 'root',
                        select: "-_id name file slug",
                    }
                }
            })
            .populate({
                path: 'parent.refid',
                select: "name file slug",
                populate: {
                    path: 'parent.refid',
                    select: "name file slug",
                    populate: {
                        path: 'parent.refid',
                        select: "-_id name file slug",
                    }
                }
            })
            .populate({
                path: 'parent.refid',
                select: "name file slug",
                populate: {
                    path: 'root',
                    select: "name file slug",
                    populate: {
                        path: 'parent.refid',
                        select: "-_id name file slug",
                    }
                }
            })
        return category;
    } catch (error) {
        throw error;
    }
}

exports.getCategoryByCategoryId = async (id) => {
    try {
        let brand = await db.Category.find({ catid: id });
        return brand;
    } catch (error) {
        throw error;
    }
}

exports.search = async (query, page = 1, limit = 30, projection = {}) => {
    try {
        let category = await db.Category.find(query, projection)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 })
            .populate([{ path: 'parent', match: { _id: { $exists: true } } }]);
        let count = await db.Category.find(query).countDocuments()
        let result = {
            data: category,
            totalResults: count,
            totalPages: Math.ceil(count / limit) == 0 ? 1 : Math.ceil(count / limit),
            page: page,
            limit: limit,
            isLastPage: (limit * page) > count ? true : false,
        }
        return result;
    } catch (error) {
        throw error;
    }
}


exports.count = async (query) => {
    try {
        let response = await db.Category.find(query).countDocuments();
        return response;
    } catch (error) {
        throw error;
    }
}

exports.update = async (query, obj) => {
    try {
        let category = await db.Category.findOneAndUpdate(query, { $set: obj }, {
            new: true,
            upsert: false,
            useFindAndModify: false
        }).exec();
        return category;
    } catch (error) {
        throw error;
    }
}

exports.searchCategory = async (query, page, limit) => {
    try {
        const projection = { isActive: 0, isDelete: 0, _id: 0, updatedAt: 0, createdAt: 0, __v: 0, root: 0, parent: 0 };
        let category = await db.Category.find(query, projection).limit(limit * 1).skip((page - 1) * limit);
        let data = [];
        let isLastPage = false;
        let count = await db.Category.find(query).countDocuments();
        const settings = await settingsService.findOne({ refid: "100" });

        if (count <= limit * page) {
            isLastPage = true;
        }

        for (let i = 0; i < category.length; i++) {
            data.push({
                id: i,
                name: category[i]?.name,
                image: base_url + category[i]?.thumbnail,
                style: {
                    text_style: {
                        text: theme.buttons.SUBMIT,
                        'font-size': category[i]?.style?.text?.fontSize,
                        "font-style": theme.fonts.FONT_STYLE,
                        "font-weight": theme.fonts.FONT_SEMIBOLD,
                        color: "0xff" + (category[i]?.style?.text?.color?.split('#')[1] || ''),
                    },
                    bgcolor: [
                        "0xff" + (category[i]?.style?.background?.split('#')[1] || ''),
                    ],
                    border: "0xff" + (category[i]?.style?.border?.split('#')[1] || ''),
                    radius: category[i]?.style?.radius,
                },
                params: {
                    slug: String(category[i]?.slug)
                },
                isLanding: category[i]?.isLanding || false
            });
        }

        let result = {};
        result.page = Number(page);
        result.selected_border = settings?.colors?.primary;
        result.per_page = limit;
        result.categories = data;
        result.pcategorie_height = 46;
        result.categorie_visibility = true;
        result.initial_selectedval = 0;
        result.last_page = isLastPage;
        result.header = [{
            type: "text",
            title: {
                "text": theme?.labels?.CATEGORY, // Adding conditional chaining here
                "bgcolor": settings?.colors?.primary,
                "color": theme.colors.WHITE,
                "font": settings?.fonts?.family,
                "font-style": theme.fonts.FONT_STYLE,
                "font-size": theme.fonts.TITLE_SIZE,
                "font-weight": theme.fonts.FONT_WEIGHT
            },
            "Displaystatus": true
        }];

        return result;
    } catch (error) {
        throw error;
    }
};

exports.getAllCategoryBySlug = async (query) => {
    try {
        const category = await db.Category.findOne(query);
        return category;
    } catch (error) {
        throw error;
    }
}




// exports.searchCategory = async (query, page, limit) => {
//     try {
//         const projection = { isActive: 0, isDelete: 0, _id: 0, updatedAt: 0, createdAt: 0, __v: 0, root: 0, parent: 0 }
//         let category = await db.Category.find(query, projection).limit(limit * 1).skip((page - 1) * limit);
//         let data = []
//         let isLastPage = false
//         let count = await db.Category.find(query).countDocuments()
//         if (count <= (limit * page)) isLastPage = true
//         for (let i = 0; i < category.length; i++) {
//             data.push({
//                 id: i,
//                 text: {
//                     text: category[i]?.name,
//                     'font-size': category['style']['text']['fontSize'],
//                     fontSize: category[i]['style']['text']['fontSize'],
//                     fontWeight: category[i]['style']['text']['fontWeight'],
//                     'font-weight': 5,
//                     color: category[i]['style']['text']['color'],
//                 },
//                 image: base_url + category[i].file,
//                 style: {
//                     bgcolor: category[i]['style']['background'],
//                     border: category[i]['style']['border'],
//                     radius: category[i]['style']['radius']
//                 },
//                 params: { catid: category[i].catid }
//             })
//         }

//         let result = {
//             category_items: data,
//             total_items: String(count),
//             page: page,
//             items_per_page: limit,
//             last_page: isLastPage
//         }

//         return result
//     } catch (error) {
//         throw error;
//     }
// }

exports.getCategories = async (query, projection = {}, sort = {}) => {
    try {
        let category = await db.Category.find(query, projection).sort(sort).populate([
            { path: 'thumbnail', match: { _id: { $exists: true } } },
        ]);
        console.log(category, "category");
        
        return category;
    } catch (error) {
        throw error;
    }
}
exports.getCategoriesWithAllChilds = async (pipeLine) => {
    try {
        let category = await db.Category.aggregate(pipeLine);

        return category;
    } catch (error) {
        throw error;
    }
}

exports.getCategoriesForDropdown = async (query, page, limit, projection = {}, sort = { createdAt: -1 }) => {
    try {
        let category = await db.Category.find(query, projection).limit(limit * 1).skip((page - 1) * limit).sort(sort);
        return category;
    } catch (error) {
        throw error;
    }
}

exports.getCategoriesCountByQuery = async (query) => {
    try {
        let category = await db.Category.find(query).countDocuments();
        return category;
    } catch (error) {
        throw error;
    }
}

exports.categoryForDashboard = async (query, page, limit) => {
    try {
        const projection = { isActive: 0, isArchive: 0, isDelete: 0, selected: 0, _id: 0, updatedAt: 0, createdAt: 0, __v: 0, root: 0, parent: 0, isRoot: 0, isFeatured: 0 }
        let category = await db.Category.find(query, projection).limit(limit * 1).skip((page - 1) * limit).sort({ name: 1 });
        let data = []
        for (let i = 0; i < category.length; i++) {
            data.push({
                id: String(i),
                image: base_url + category[i].file,
                params: {
                    catid: String(category[i]['catid']),
                    slug: category[i]['slug']
                },
                action: '/product-listing-view',
                type: 1,
                text: {
                    text: category[i]['name'],
                    'font-size': category[i]['style']['text']['fontSize'],
                    color: "0xff" + category[i]['style']['text']['color'].split('#')[1],
                },
                style: {
                    background: "0xff" + category[i]['style']['background'].split('#')[1],
                    border: "0xff" + category[i]['style']['border'].split('#')[1],
                    radius: category[i]['style']['radius']
                }
            })
        }
        const result = {
            type: "category",
            category_items: data,
            title: {
                text: theme.labels.CATEGORY,
                color: theme.colors.BLACK,
                "font-weight": theme.fonts.FONT_BOLD
            },
            button: {
                label: {
                    text: theme.buttons.VIEW_BUTTON,
                    color: theme.colors.PRIMARY,
                    font: theme.fonts.FONT_FAMILY,
                    "font-style": theme.fonts.FONT_STYLE,
                    "font-size": theme.fonts.BUTTON_FONT_SIZE,
                    "font-weight": theme.fonts.FONT_WEIGHT
                },
                bgcolor: [
                    theme.colors.PRIMARY,
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

exports.updateCategoryById = async (body, obj) => {
    try {
        let brand = await db.Category.findOneAndUpdate(body, { $set: obj }, {
            new: true,
            upsert: false,
            useFindAndModify: false
        }).exec();
        return brand;
    } catch (error) {
        throw error;
    }
}

exports.getCategoryDetails = async (slug) => {
    try {
        
        const category = await db.Category.findOne(slug);
        return category;
    } catch (error) {
        throw error;
    }
}