const db = require("../db")
const config = require("../../config/constants/index")
const base_url = config.common.BASE_URL
const theme = require("../../config/constants/index").themeSettings

exports.createHomeSection = async (objHomeSection) => {
    try {
        let homeSection = new db.HomeSection(objHomeSection)
        await homeSection.save();
        return homeSection
    } catch (error) {
        throw (error);
    }
}

exports.getAllHomeSection = async () => {
    try {
        let homeSection = await db.HomeSection.find({ isDelete: false })
        return homeSection;
    } catch (error) {
        throw error
    }
}

exports.getHomeSection = async (slug) => {
    try {
        let homeSection = await db.HomeSection.find({ layid: slug })
            .populate({
                path: 'files.product',
                select: '_id name',
                model: 'products',
            })
        return homeSection
    } catch (error) {
        throw error
    }
}

exports.getLayoutByPage = async (page, limit) => {
    try {
        let homeSection = await db.HomeSection.find({ isDelete: false })
            .limit(limit * 1).skip((page - 1) * limit)
        return homeSection
    } catch (error) {
        throw error
    }
}

exports.getLayoutsCount = async () => {
    try {
        let layout = await db.HomeSection.find({ isDelete: false }).countDocuments()
        return layout
    } catch (error) {
        throw error
    }
}

exports.getActive = async (obj, projection = {}) => {
    try {
        let homeSection = await db.HomeSection.find(obj, projection)
        return homeSection
    } catch (error) {
        throw error;
    }
}

exports.updateHomeSection = async (slug, objHomeSection) => {
    try {
        let homeSection = await db.HomeSection.findOneAndUpdate({ layid: slug }, { $set: objHomeSection }, {
            new: true,
            upsert: false,
            useFindAndModify: false
        }).exec()
        return homeSection
    }
    catch (error) {
        throw error
    }
}


exports.sliderLayoutForDashboard = async (query, page, limit) => {
    try {
        const projection = { count: 0, type: 0, position: 0, "files._id": 0, isActive: 0, isDelete: 0, _id: 0, updatedAt: 0, createdAt: 0, __v: 0, slug: 0, product: 0 }
        let layout = await db.HomeSection.find(query, projection).limit(limit * 1).skip((page - 1) * limit);
        for (let _lay of layout) {
            for (_files of _lay.files) {
                _files.file = base_url + _files.file
            }
        }
        let data, response = []
        for (let i = 0; i < layout.length; i++) {
            data = []
            for (let file of layout[i].files) {
                data.push({
                    id: String(i),
                    params: {
                        layid: layout[i]['layid']
                    },
                    image: file['file']
                })
            }
            const result = {
                refid: layout[i]['layid'],
                type: 'carousel',
                carausel_items: data,
                scrollbarcolor: theme.colors.SCROLLBAR,
                border_radious: theme.general.BORDER_RADIUS,
                Displaystatus: true
            }
            response.push(result)
        }
        return response;
    } catch (error) {
        throw error;
    }
}