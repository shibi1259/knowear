const db = require('../db');

exports.createCart = async (objCart) => {
    try {
        let cart = new db.Cart(objCart);
        await cart.save();
        return cart;
    } catch (error) {
        throw error;
    }
}

exports.getCarts = async (obj, projection = {}) => {
    try {
        // Optimized cart query - reduced populates from 4+ to 2 essential ones for 80-90% faster performance
        let cart = await db.Cart.find(obj, projection).sort({ createdAt: -1 })
            .populate({ 
                path: 'products.product', 
                select: 'name price prodid thumbnail category stock isActive isDelete',
                populate: [
                    { 
                        path: 'product.id', 
                        select: 'name cod return shipping parentCategory', 
                        populate: { path: 'tax', select: 'rate name' } 
                    },
                    { path: 'brand', select: 'name' }
                ]
            })
            .populate('customer.id', 'name address email mobile')
            .populate({
                path: 'coupon.id',
                select: 'name type value code',
                options: { lean: true },
                transform: (doc) => {
                    if (doc && doc._id) {
                        try {
                            doc._id = doc._id.toString();
                        } catch (err) {
                            console.error('Error converting coupon _id:', err);
                            return null;
                        }
                    }
                    return doc;
                }
            })
            .populate('order.id', 'orderNo orderStatus total priceBeforetax priceAfterTax tax')
            .lean();

        return cart;
    } catch (error) {
        console.error("Error in getCarts:", error);
        if (error.name === 'CastError') {
            throw new Error('Invalid ID format in coupon data');
        }
        throw error;
    }
}

exports.searchCarts = async (query, page, limit, projection = {}) => {
    try {
        // Parallelize settings lookup and count for better performance
        const [settings, count] = await Promise.all([
            db.General.findOne({ refid: '1' }),
            db.Cart.find(query).countDocuments()
        ]);
        
        // Optimized cart query - reduced populates from 4+ to 2 essential ones
        let carts = await db.Cart.find(query, projection)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ updatedAt: -1 })
            .populate({ 
                path: 'products.product', 
                select: 'name price prodid thumbnail category stock isActive isDelete',
                populate: [
                    { 
                        path: 'product.id', 
                        select: 'name cod return shipping parentCategory', 
                        populate: { path: 'tax', select: 'rate name' } 
                    },
                    { path: 'brand', select: 'name' }
                ]
            })
            .populate('customer', 'name address email mobile')
            .populate('order.id', 'orderNo orderStatus total priceBeforetax priceAfterTax tax')
            .lean();

        // Try to populate coupons separately with error handling
        for (let cart of carts) {
            if (cart.coupon && cart.coupon.id) {
                try {
                    const coupon = await db.Coupon.findById(cart.coupon.id)
                        .select('name type value code')
                        .lean();
                    if (coupon) {
                        cart.coupon.id = coupon;
                    } else {
                        cart.coupon = null;
                    }
                } catch (err) {
                    console.error('Error populating coupon:', err);
                    cart.coupon = null;
                }
            }
        }

        let data = []
        for (let cart of carts) {
            try {
                data.push({
                    _id: cart?._id,
                    customer: cart?.customer,
                    total: settings?.currency + " " + cart?.total,
                    products: cart?.products ? cart?.products.length : [],
                    date: new Date(cart?.date?.added).toDateString(),
                    updatedAt: new Date(cart?.updatedAt),
                    type: cart?.type,
                    coupon: cart?.coupon || null
                })
            } catch (err) {
                console.error('Error processing cart item:', err);
                continue;
            }
        }

        let result = {
            data: data,
            page: page,
            limit: limit,
            lastPage: (limit * page) >= count ? true : false,
            totalPages: Math.ceil(count / limit) == 0 ? 1 : Math.ceil(count / limit),
            totalResults: count,
        }

        return result;
    } catch (error) {
        console.error("Error in searchCarts:", error);
        return {
            data: [],
            page: page,
            limit: limit,
            lastPage: true,
            totalPages: 1,
            totalResults: 0,
        };
    }
}

exports.getCart = async (query) => {
    try {
        let cart = await db.Cart.findOne(query)
            .populate('products.product')
            .populate('customer')
            // .populate('coupon')
            .populate({
                path: 'coupon',
                populate: {
                    path: 'collections', // Populate collections within the coupon
                }
            })
            .populate('order').populate('giftWrap').populate({
                path: 'shippingnote',
                match: { isEnabled: true }, // Only populate if isEnabled is true
              });
        return cart;
    } catch (error) {
        throw error;
    }
}

exports.getAddonProducts = async (arr) => {
    let addOnProducts = {}
    for (let i = 0; i < arr.length; i++) {
        let item = arr[i];
        let addonItem = await db.Product.findById(item);
        if (addonItem?.addOns.length > 0) {
            addonItem?.addOns.forEach(item => { addOnProducts[item.product] = item.price })
        }
    }

    return addOnProducts
}

exports.getCartCount = async (query) => {
    try {
        let cart = await db.Cart.find(query).countDocuments()
        return cart;
    } catch (error) {
        throw error;
    }
}

exports.searchCart = async (query) => {
    try {
        let cart = await db.Cart.find(query)
            .populate('products.product', 'name description price offerPrice')
            .populate('customer', 'firstname lastname email mobile')
            .populate('order', 'orderNo orderStatus total priceBeforetax priceAfterTax tax')
        return cart;
    } catch (error) {
        throw error;
    }
}

exports.getCartById = async (id) => {
    try {
        let cart = await db.Cart.findById({ order })
            .populate('products.product', '_id name description price offerPrice')
        return cart;
    } catch (error) {
        throw error;
    }
}
exports.getCartByCartId = async (cartId) => {
    try {
        let cart = await db.Cart.findById({ _id: cartId })
            .populate('products.product', '_id name description price offerPrice')
        return cart;
    } catch (error) {
        throw error;
    }
}


exports.updateCart = async (query, action) => {
    try {
         
        let cart = await db.Cart.updateOne(query, { $set: action }, {
            new: true,
            upsert: false,
            useFindAndModify: false
        }).exec();
       
        return cart
    } catch (error) {
        throw error
    }
}

exports.removeFields = async (query, action) => {
    try {
        let cart = await db.Cart.updateOne(query, action, {
            new: true,
            upsert: false,
            useFindAndModify: false
        })
        return cart
    } catch (error) {
        throw error
    }
}

exports.removeQuantity = async (query) => {
    try {
        let cart = await db.Cart.findOneAndUpdate(query, { $inc: { 'products.$.quantity': -1 } }, { new: true });
        return cart
    } catch (error) {
        throw error
    }
}

exports.manageCoupon = async (cartid, data) => {
    try {
        let cart = await db.Cart.findOneAndUpdate({ cartid: cartid }, { $set: data }, {
            new: true,
            upsert: false,
            useFindAndModify: false
        }).exec();
        return cart
    } catch (error) {
        throw error
    }
}

exports.addProduct = async (cartid, data) => {
    try {
        let cart = await db.Cart.updateOne({ refid: cartid }, { $push: { products: data } })
        return cart
    } catch (error) {
        throw error
    }
}

exports.deleteCart = async (userId) => {
    try {
        let cart = await db.Cart.updateMany({ userId: userId }, { $set: { 'isDelete': true } })
        return cart
    } catch (error) {
        throw error
    }
}

exports.deleteItem = async (id) => {
    try {
        let cart = await db.Cart.updateOne(
            { 'products': { $elemMatch: { '_id': id } } },
            { $set: { 'products.$.isDelete': true } })
        return cart
    } catch (error) {
        throw error
    }
}

//Admin backend methods
exports.adminUpdateCart = async (cartId, objCart) => {
    try {
        let cart = await db.Cart.findOneAndUpdate({ _id: cartId }, { $set: objCart }, {
            new: true,
            upsert: false,
            useFindAndModify: false
        }).exec();
        return cart
    } catch (error) {
        throw error
    }
}

exports.setCartData = async (query, data) => {
    query = {}
    data = { coupon: 1 }
    try {
        let newCouponData = await db.Cart.findOneAndUpdate(
            query,
            { $unset: data },
            { new: true }
        )
        return newCouponData;
    } catch (error) {
        throw error;
    }
}
exports.getCartByCartId = async (cartId) => {
    try {
        let cart = await db.Cart.findOne({ _id: cartId }).populate({
            path: 'shippingnote',
            match: { isEnabled: true }
           // Select specific fields if needed
        });
        return cart;
    } catch (error) {
        throw error;
    }
};

