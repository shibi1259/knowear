const db = require("../db")

exports.addDashboard = async (data) => {
    try {
        let response = new db.Dashboard(data)
        await response.save()
        return response
    } catch (error) {
        throw error
    }
}

exports.findDashboard = async (query, projection) => {
    try {
        let response = await db.Dashboard.find(query, projection)
        return response
    } catch (error) {
        throw error
    }
}

exports.getDashboardDetails = async (query, sort, limit) => {
    try {
        let response = await db.Dashboard.find(query).sort(sort).limit(limit)
        
        
        return response
    } catch (error) {
        throw error
    }
}

exports.countDashboard = async (query) => {
    try {
        let response = await db.Dashboard.find(query).countDocuments()
        return response
    } catch (error) {
        throw error
    }
}

exports.findOneDashboard = async (query, projection) => {
    try {
        let response = await db.Dashboard.findOne(query, projection)
        return response
    } catch (error) {
        throw error
    }
}

exports.updateDashboard = async (query, data) => {
    try {
        let response = await db.Dashboard.findOneAndUpdate(query, { $set: data }, {
            new: true,
            upsert: false,
            useFindAndModify: false
        }).exec();
        return response;
    } catch (error) {
        throw error
    }
}

exports.addPreiewDashboard = async (data) => {
    try {
        let response = new db.PreiewDashboard(data)
        await response.save()
        return response
    } catch (error) {
        throw error
    }
}

exports.findPreiewDashboard = async (query, projection) => {
    try {
        let response = await db.PreiewDashboard.find(query, projection)
        return response
    } catch (error) {
        throw error
    }
}

exports.countPreiewDashboard = async (query) => {
    try {
        let response = await db.PreiewDashboard.find(query).countDocuments()
        return response
    } catch (error) {
        throw error
    }
}

exports.findOnePreiewDashboard = async (query, projection) => {
    try {
        let response = await db.PreiewDashboard.findOne(query, projection)
        return response
    } catch (error) {
        throw error
    }
}

exports.updatePreiewDashboard = async (query, data) => {
    try {
        let response = await db.PreiewDashboard.findOneAndUpdate(query, { $set: data }, {
            new: true,
            upsert: false,
            useFindAndModify: false
        }).exec();
        return response;
    } catch (error) {
        throw error
    }
}