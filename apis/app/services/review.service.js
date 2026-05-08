const db = require('../db')

exports.createReview = async (data) => {
    try {
        let review = new db.Review(data);
        await review.save();
        return review;
    } catch (_err) {
        throw _err;
    }
}

exports.getReviews = async () => {
    try {
        let review = db.Review.find({ isDelete: false }).populate('product.id', 'prodid name').populate('order.id', 'orderNo').populate('customer.id', 'name mobile email')
        return review
    } catch (_err) {
        throw _err
    }
}

exports.searchReviews = async (query, page, limit, projection = {}) => {
    try {
        let count = await db.Review.find(query).countDocuments()
        let reviews = await db.Review.find(query, projection).limit(limit * 1).skip((page - 1) * limit).sort({ created: -1 })
            .populate('product.id', 'prodid name sku')
            .populate('order.id', 'orderNo')
            .populate('customer.id', 'name mobile email')
        let result = {
            data: reviews,
            isLastPage: (limit * page) > count ? true : false,
            page: page,
            limit: limit,
            totalPages: Math.ceil(count / limit),
            totalResults: count
        }
        return result
    } catch (_err) {
        throw _err
    }
}

exports.productReviews = async (query, projection = {}) => {
    try {
        let reviews = await db.Review.find(query, projection).sort({ created: -1 })
            .populate('product.id', 'prodid name sku')
            .populate('order.id', 'orderNo')
            .populate('customer.id', 'name mobile email')
        let totalReviews = await db.Review.find(query).countDocuments()
        let result = {
            reviews: reviews,
            totalReviews: totalReviews
        }
        return result
    } catch (_err) {
        throw _err
    }
}

exports.getReview = async (code) => {
    try {
        let review = db.Review.find({ code: code }).populate({
            path: 'order',
            model: 'orders',
            select: 'orderNo',
            populate: {
                path: 'product.productId',
                model: 'products',
                select: 'name'
            }
        })
        return review
    } catch (_err) {
        throw _err
    }
}

exports.getSingleReview = async (query, projection = {}) => {
    try {
        let review = db.Review.findOne(query, projection)
        return review
    } catch (_err) {
        throw _err
    }
}

exports.getReviewByQuery = async (query) => {
    try {
        let review = db.Review.find(query).populate('customer.id', '-_id name').sort({ createdAt: -1 })
        return review
    } catch (_err) {
        throw _err
    }
}

exports.getReviewByAgg = async (query) => {
    try {
        let review = db.Review.aggregate(query)
        return review
    } catch (_err) {
        throw _err
    }
}

exports.getReviewCount = async (query) => {
    try {
        let review = db.Review.find(query).countDocuments()
        return review
    } catch (_err) {
        throw _err
    }
}

exports.updateReview = async (query, data) => {
    try {
        let review = db.Review.findOneAndUpdate(query, { $set: data }, {
            new: true,
            upsert: false,
            useFindAndModify: false
        }).exec()
        return review
    } catch (_err) {
        throw _err
    }
}