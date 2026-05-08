const db = require('../db')

exports.createRole = async (data) => {
    try {
        let role = new db.Role(data);
        await role.save();
        return role;
    } catch (error) {
        throw error;
    }
}

exports.getRoles = async (query, projection = {}) => {
    try {
        let role = await db.Role.find(query, projection);
        return role;
    } catch (error) {
        throw error;
    }
}

exports.getRoleDetails = async (query, projection = {}) => {
    try {
        let role = await db.Role.findOne(query, projection).populate('permissions', 'refid name tag');
        return role;
    } catch (error) {
        throw error;
    }
}

exports.searchRoles = async (query, page, limit, projection = {}, sort = {}) => {
    try {
        let roles = await db.Role.find(query, projection).limit(limit * 1).skip((page - 1) * limit).sort(sort);
        let count = await db.Role.find(query).countDocuments()
        let result = {
            data: roles,
            totalResults: count,
            page: page,
            items_per_page: limit,
            totalPages: Math.ceil(count / limit) == 0 ? Math.ceil(count / limit) : 1,
            isLastPage: (limit * page) > count ? true : false,
        }
        return result;
    } catch (error) {
        throw error;
    }
}

exports.getRolesCount = async (query) => {
    try {
        let role = await db.Role.find(query).countDocuments();
        return role;
    } catch (error) {
        throw error;
    }
}

exports.updateRole = async (query, data) => {
    try {
        let role = await db.Role.findOneAndUpdate(query, { $set: data }, {
            new: true,
            upsert: false,
            useFindAndModify: false
        }).exec();
        return role;
    } catch (error) {
        throw error;
    }
}