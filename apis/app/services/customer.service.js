const db = require("../db")

exports.create = async (data) => {
    try {
        let customer = new db.Customer(data)
        await customer.save()
        return customer;
    } catch (error) {
        throw (error);
    }
}

exports.getAllClient = async () => {
    try {
        let customer = await db.Customer.find({ isDelete: false })
        return customer;
    } catch (error) {
        throw (error);
    }
}

exports.getClient = async (obj, projection = {}) => {
    try {
        let customer = await db.Customer.find(obj, projection)
        return customer
    } catch (error) {
        throw (error);
    }
}

exports.getCustomers = async (query, projection = {}) => {
    try {
        let customers = await db.Customer.find(query, projection).sort({ createdAt: -1 })
        return customers
    } catch (error) {
        throw (error);
    }
}

exports.getCustomer = async (obj, projection = {}) => {
    try {
        let customer = await db.Customer.findOne(obj, projection)
            .populate('wishlist')
        return customer
    } catch (error) {
        throw (error);
    }
}

exports.getFavourites = async (obj, limit, page, projection = {}) => {
    try {
        let customer = await db.Customer.findOne(obj, projection)
            .populate('wishlist')
        return customer
    } catch (error) {
        throw (error);
    }
}

exports.getClientCount = async () => {
    try {
        let customer = await db.Customer.find({ isActive: true, isDelete: false }).countDocuments()
        return customer
    } catch (error) {
        throw (error);
    }
}

exports.getCustomerCount = async (query) => {
    try {
        let customer = await db.Customer.find(query).countDocuments()
        return customer
    } catch (error) {
        throw (error);
    }
}

exports.updateClient = async (id, objClient) => {
    try {
        let client = await db.Customer.findOneAndUpdate({ userid: id }, { $set: objClient }, {
            new: true,
            upsert: false,
            useFindAndModify: false
        }).exec()
        return client
    } catch (error) {
        throw (error)
    }
}

//Web and App APIs
exports.getCustomerByUserId = async (query, projection = {}) => {
    try {
        let client = await db.Customer.find(query, projection)
        return client
    } catch (error) {
        throw (error);
    }
}

exports.getCustomerByQuery = async (obj, projection = {}) => {
    try {
        let client = await db.Customer.find(obj, projection).populate('wishlist')
        return client
    } catch (error) {
        throw (error);
    }
}

exports.getCustomerDetails = async (obj, projection = {}) => {
    try {
        let client = await db.Customer.findOne(obj, projection)
            .populate('wishlist', 'name price thumbnail')
            .populate({ path: 'referralSource.user', match: { _id: { $exists: true } } })
        return client
    } catch (error) {
        throw (error);
    }
}

exports.aggregate = async (query) => {
    try {
        let result = await db.Customer.aggregate(query)
        return result
    } catch (error) {
        throw (error);
    }
}

exports.searchCustomers = async (query, page = 1, limit = 20, projection = {}) => {
    try {
        let count = await db.Customer.find(query).countDocuments()
        let customers = await db.Customer.find(query, projection)
            .limit(limit * 1).skip((page - 1) * limit)
            .sort({ createdAt: -1 })
            .populate('wishlist')
        return {
            data: customers,
            page: page,
            totalResults: count,
            limit: limit,
            totalPages: Math.ceil(count / limit) == 0 ? 1 : Math.ceil(count / limit),
            isLastPage: (limit * page) > count ? true : false,
        }
    } catch (error) {
        throw (error);
    }
}

exports.searchWishlistedCustomers = async (query, page, limit, projection = {}) => {
    try {
        let count = await db.Customer.find(query).countDocuments()
        let customerDetails = []
        let customers = await db.Customer.find(query, projection).limit(limit * 1).skip((page - 1) * limit).sort({ name: 1 })

        for (let customer of customers) {
            customerDetails.push({
                name: customer?.name,
                email: customer?.email,
                mobile: customer?.countryCode + customer?.mobile,
                products: customer?.wishlist ? customer?.wishlist.length : 0,
                slug: customer?.slug,
                userid: customer?.userid
            })
        }

        let result = {
            data: customerDetails,
            page: page,
            limit: limit,
            totalPages: Math.ceil(count / limit) == 0 ? 1 : Math.ceil(count / limit),
            isLastPage: (limit * page) > count ? true : false,
            totalResults: count
        };
        return result
    } catch (error) {
        throw (error);
    }
}

exports.updateCustomer = async (id, data) => {
    try {
        let client = await db.Customer.updateOne({ userid: id, isActive: true, isDelete: false }, { $set: data }, {
            new: true,
            upsert: false,
            useFindAndModify: false
        }).exec()
        return client
    } catch (error) {
        throw (error)
    }
}
exports.customerReferer = async (email, data) => {
    try {
        // console.log("referer", data);
        // console.log("email", email);
        let customer = await db.Customer.updateOne({ email: email, isActive: true, isDelete: false }, { $set: data }, {
            new: true,
            upsert: false,
            useFindAndModify: false
        }).exec()
        return customer
    } catch (error) {
        throw (error)
    }
}

exports.update = async (query, action) => {
    try {
        let client = await db.Customer.updateOne(query, action, { new: true, upsert: false, useFindAndModify: false }).exec()
        return client
    } catch (error) {
        throw (error)
    }
}

exports.findByIdAndUpdate = async (id, action) => {
    try {
        let customerData = await db.Customer.findByIdAndUpdate(id, action, {
            new: true,
            upsert: false,
            useFindAndModify: false
        }).exec()
        return customerData
    } catch (error) {
        throw (error)
    }
}