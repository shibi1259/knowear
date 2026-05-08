const db = require('../db')


exports.createUser = async (objUser) => {
    try {
        let user = new db.Customer(objUser);
        await user.save();
        return user;
    } catch (error) {
        throw error;
    }
}

exports.createToken = async (id, token) => {
    try {
        let user = await db.Customer.findOneAndUpdate({ _id: id }, { $set: { token: token } })
        return user
    } catch (error) {
        throw error
    }
}


exports.getUser = async (obj) => {
    try {
        let user = await db.Customer.findOne(obj);
        return user;
    } catch (error) {
        throw error;
    }
}


exports.getUserByMobile = async (mobile) => {
    try {
        let user = await db.Customer.findOne({ mobile: mobile });
        return user;
    } catch (error) {
        throw error;
    }
}


exports.getUserById = async (id) => {
    try {
        let user = await db.Customer.findById(id);
        return user;
    } catch (error) {
        throw error;
    }
}


exports.updateUser = async (query, data) => {
    try {
        let user = await db.Customer.findOneAndUpdate(query, data, { new: true, upsert: false, useFindAndModify: false }).exec();
        return user;
    } catch (error) {
        throw error;
    }
}

exports.generatePayload = (obj) => {
    return {
        countryCode: obj?.countryCode,
        mobile: obj?.mobile,
        username: obj?.username,
        email: obj?.email,
        userid: obj?.userid,
        name: obj?.name,
        _id: obj?._id,
        deviceToken: obj?.deviceToken,
        deviceType: obj?.deviceType,
        refid: obj?.refid,
        isGuest: obj?.isGuest
    }
}

exports.generateGuestPayload = (obj) => {
    return {
        mobile: obj?.mobile,
        username: obj?.username,
        email: obj?.email,
        userid: obj?.userid,
        name: obj?.name,
        _id: obj?._id,
        deviceToken: obj?.deviceToken,
        deviceType: obj?.deviceType,
        refid: obj?.refid,
        isGuest: obj?.isGuest
    }
}

exports.updateLoginStatus = async (userid) => {
    try {
        let user = await db.Customer.findOneAndUpdate({ userid: userid }, { loginStatus: true }, {
            new: true,
            upsert: false,
            useFindAndModify: false
        })
        return user
    } catch (error) {
        throw error
    }
}

//Backend auth functions
exports.createAdmin = async (objAdmin) => {
    try {
        let admin = new db.Admin(objAdmin);
        await admin.save();
        return admin;
    } catch (error) {
        throw error;
    }
}

exports.getLoginAdminByUsername = async (obj) => {
    try {
        const agg = [
            {
                $match: {
                    'email': obj.email,
                    'isActive': obj.isActive,
                    'isDelete': obj.isDelete
                }
            },
            {
                $lookup: {
                    'from': 'roles',
                    'localField': 'roleId',
                    'foreignField': '_id',
                    'as': 'roles'
                }
            },
            {
                $lookup: {
                    'from': 'permissions',
                    'localField': 'roles.permission',
                    'foreignField': '_id',
                    'as': 'permissioms'
                }
            },
            {
                $project: {
                    '_id': 1,
                    'username': 1,
                    "password": 1,
                    'roleId': 1,
                    'roleName': '$roles.name',
                    'firstName': 1,
                    'lastName': 1,
                    'countryCode': 1,
                    'mobile': 1,
                    'email': 1,
                    'isActive': 1,
                    'isDelete': 1,
                    slug: 1,
                    'permissionName': '$permissioms.code'
                }
            }
        ];

        let admin = await db.Admin.aggregate(agg).exec()

        return admin;
    } catch (error) {
        throw error;
    }
}


exports.getAdminByUsername = async (obj) => {
    try {
        let admin = await db.Admin.findOne(obj);

        return admin;
    } catch (error) {
        throw error;
    }
}

exports.getAdminUsers = async () => {
    try {
        const agg = [
            {
                $lookup: {
                    'from': 'roles',
                    'localField': 'roleId',
                    'foreignField': '_id',
                    'as': 'roles'
                }
            },
            {
                $lookup: {
                    'from': 'permissions',
                    'localField': 'roles.permission',
                    'foreignField': '_id',
                    'as': 'permissioms'
                }
            },
            {

                $project: {
                    '_id': 1,
                    'username': 1,
                    'roleId': 1,
                    'roleName': '$roles.name',
                    'firstName': 1,
                    'lastName': 1,
                    'countryCode': 1,
                    'mobile': 1,
                    'email': 1,
                    'slug': 1,
                    'isActive': 1,
                    'isDelete': 1,
                    'permissionName': '$permissioms.code'
                }
            }
        ];

        let admin = await db.Admin.aggregate(agg).exec()
        return admin
    } catch (error) {
        throw error
    }
}

exports.updateAdminLoginStatus = async (email) => {
    try {
        let admin = await db.Admin.findOneAndUpdate({ email: email }, { loginStatus: true }, {
            new: true,
            upsert: false,
            useFindAndModify: false
        })
        return admin
    } catch (error) {
        throw error
    }
}

exports.getAdminUser = async (slug) => {
    try {
        const agg = [
            {
                '$match': {
                    'slug': slug
                }
            },
            {
                $lookup: {
                    'from': 'roles',
                    'localField': 'roleId',
                    'foreignField': '_id',
                    'as': 'roles'
                }
            },
            {
                $lookup: {
                    'from': 'permissions',
                    'localField': 'roles.permission',
                    'foreignField': '_id',
                    'as': 'permissioms'
                }
            },
            {

                $project: {
                    '_id': 1,
                    'username': 1,
                    'roleName': '$roles.name',
                    'role': 1,
                    'firstname': 1,
                    'lastname': 1,
                    'countryCode': 1,
                    'mobile': 1,
                    'email': 1,
                    'slug': 1,
                    'isActive': 1,
                }
            }
        ];
        let admin = await db.Admin.aggregate(agg).exec()
        return admin
    } catch (error) {
        throw error
    }
}

exports.updateAdmin = async (slug, objAdmin) => {
    try {
        let admin = await db.Admin.findOneAndUpdate({ slug: slug }, objAdmin, {
            new: true,
            upsert: false,
            useFindAndModify: false
        })
        return admin
    } catch (error) {
        throw error
    }
}

exports.updateAdminByQuery = async (query, data) => {
    try {
        let admin = await db.Admin.updateOne(query, { $set: data }, {
            new: true,
            upsert: false,
            useFindAndModify: false
        })
        return admin
    } catch (error) {
        throw error
    }
}

exports.findAdminByEmail = async (obj) => {
    try {
        let admin = await db.Admin.find(obj).count()
        return admin
    } catch (error) {
        throw error
    }
}

exports.getAdminCount = async (query) => {
    try {
        let response = await db.Admin.find(query).countDocuments()
        return response
    } catch (error) {
        throw error
    }
}

exports.getAdmins = async (query, projection = {}, sort = {}) => {
    try {
        let admins = await db.Admin.find(query, projection).sort(sort)
        return admins
    } catch (error) {
        throw error
    }
}

exports.adminDetails = async (obj, projection = {}) => {
    try {
        let admin = await db.Admin.findOne(obj, projection)
        return admin
    } catch (error) {
        throw error
    }
}

exports.searchAdminUsers = async (query, page, limit, projection = {}) => {
    try {
        let admins = await db.Admin.find(query, projection).limit(limit * 1).skip((page - 1) * limit).sort({ createdAt: -1 })
        let count = await db.Admin.find(query).countDocuments()
        let result = {
            data: admins,
            totalResults: count,
            page: page,
            items_per_page: limit,
            totalPages: Math.ceil(count / limit),
            lastPage: (limit * page) > count ? true : false,
        }
        return result;
    } catch (error) {
        throw error
    }
}

exports.customersCount = async (obj) => {
    try {
        let admin = await db.Customer.find(obj).countDocuments()
        return admin
    } catch (error) {
        throw error
    }
}

