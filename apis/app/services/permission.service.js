const db = require('../db')

exports.create = async (objPermission) => {
    try {
        let permission = new db.Permission(objPermission);
        await permission.save();
        return permission;
    } catch (error) {
        throw error;
    }
}

exports.findOne = async (query) => {
    try {
        let permission = await db.Permission.findOne(query);
        return permission;
    } catch (error) {
        throw error;
    }
}

exports.find = async (query) => {
    try {
        let permission = await db.Permission.find(query);
        return permission;
    } catch (error) {
        throw error;
    }
}

exports.aggregate = async (query) => {
    try {
        let permission = await db.Permission.aggregate(query);
        return permission;
    } catch (error) {
        throw error;
    }
}

exports.deleteMany = async () => {
    try {
        const respone = await db.Permission.deleteMany({});
        return respone;
    } catch (error) {
        throw error;
    }
};
