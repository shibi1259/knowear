const db = require('../db')

exports.create = async (objTaxRules) => {
    try {
        let rule = new db.TaxRules(objTaxRules);
        await rule.save();
        return rule;
    } catch (error) {
        throw error;
    }
}

exports.find = async (obj, projection = {}) => {
    try {
        let rules = await db.TaxRules.find(obj, projection);
        return rules;
    } catch (error) {
        throw error;
    }
}

exports.findOne = async (obj, projection = {}) => {
    try {
        let rule = await db.TaxRules.findOne(obj, projection);
        return rule;
    } catch (error) {
        throw error;
    }
}

exports.search = async (query, page, limit, projection = {}) => {
    try {
        let rules = await db.TaxRules.find(query, projection).limit(limit * 1).skip((page - 1) * limit).sort({ createdAt: -1 });
        let count = await db.TaxRules.find(query).countDocuments()
        let result = {
            data: rules,
            totalResults: count,
            page: page,
            items_per_page: limit,
            totalPages: Math.ceil(count / limit),
            isLastPage: (limit * page) > count ? true : false,
        }
        return result;
    } catch (error) {
        throw error;
    }
}

exports.update = async (query, data) => {
    try {
        let rule = await db.TaxRules.findOneAndUpdate(query, { $set: data }, {
            new: true,
            upsert: false,
            useFindAndModify: false
        }).exec();
        return rule;
    } catch (error) {
        throw error;
    }
}
