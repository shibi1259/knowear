const { BASE_URL } = require("../../config/constants/common");
const db = require("../db");
const priceCheck = require('../../util/priceCheck');
const { months } = require("../../util/months");
const { convertToAMPM } = require("../../util/time/convertToAMPM");
const { text } = require("body-parser");

exports.createOrder = async (objOrder) => {
  try {
    let order = new db.Order(objOrder);
    await order.save();
    return order;
  } catch (error) {
    throw error;
  }
};

exports.getOrders = async (query, projection = {}, sort = {}) => {
  try {
    let orders = await db.Order.find(query, projection).sort(sort)
      .populate([
        { path: "clickPoint", match: { _id: { $exists: true } } },
        { path: "guestId", match: { _id: { $exists: true } } },
        { path: "customerId", match: { _id: { $exists: true } } },
        { path: "products.productId", match: { _id: { $exists: true } } },
      ]);
    return orders;
  } catch (error) {
    return error
  }
}

exports.getAllOrder = async () => {
  try {
    let order = await db.Order.find({ isDelete: false }).populate("customerId", "-_id name mobile email address countryCode");
    return order;
  } catch (error) {
    throw error;
  }
};

exports.getOrdersForWeb = async (query, page, limit, projection = {}) => {
  try {
    let response = await db.Order.find(query, projection).limit(limit * 1).skip((page - 1) * limit).sort({ createdAt: -1 })
    let count = await db.Order.find(query).countDocuments();
    let settings = await db.General.findOne()
    let orders = []
    for (let data of response) {
      let products = []
      for (let product of data?.products) {
        let latestStatus = product?.history.pop()
        let productDetails = await db.Product.findOne({ _id: product?.productId })
        products.push({
          name: { text: productDetails?.name },
          thumbnail: { text: BASE_URL + productDetails?.thumbnail },
          overView: { text: productDetails?.overview },
          quantity: { text: product?.quantity },
          attributes: productDetails?.attributes,
          price: { text: settings?.currency + " " + (Number(product?.pricePerUnit) || 0).toFixed(2) },
          params: {
            prodid: productDetails?.prodid,
            slug: productDetails?.slug
          },
          status: { text: latestStatus?.status },
          date: { text: latestStatus?.date }
        })
      }

      orders.push({
        orderNo: { text: data?.orderNo },
        orderId: { text: data?._id },
        orderDate: { text: data?.createdAt },
        orderTime: { text: data?.createdAt },
        orderTotal: { text: settings?.currency + " " + data?.total },
        orderStatus: { text: data?.orderStatus },
        paymentMethod: { text: data?.paymentMethod || "" },
        products: products
      })
    }

    let result = {
      totalOrders: count,
      page: page,
      limit: limit,
      lastPage: (limit * page) > count ? true : false,
      orders: orders
    }

    return result;
  } catch (error) {
    throw error;
  }
};

function returnValidaty(details) {
  const timeZone = 'Asia/Kolkata'
  const today = new Date(new Date(new Date().setHours(23, 59, 59, 59)).toLocaleString('en-US', { timeZone }))
  const orderDate = new Date(new Date(new Date(details?.createdAt).setHours(0, 0, 0, 0)).toLocaleString('en-US', { timeZone }))
  orderDate.setDate(orderDate.getDate() + details?.days);
  let response = { isReturnable: false, message: "Return not available" }
  if (today < orderDate) {
    response = { isReturnable: true, message: `Return available till ${months[orderDate.getMonth()]} ${orderDate.getDate()} ${orderDate.getFullYear()}` }
  }
  return response
}

exports.getOrderDetailsForWeb = async (query, projection = {}) => {
  try {
    let orderDetails = await db.Order.findOne(query, projection).populate("customerId", "-_id name mobile email countryCode userid")
      .populate("guestId", "countryCode mobile status ");
// console.log(orderDetails)
    let settings = await db.General.findOne()
    let products = []

    for (let product of orderDetails?.products) {
      let review = await db.Review.findOne({ 'order.refid': orderDetails?.refid, 'product.id': product?.productId })
      let productDetails = await db.Product.findOne({ _id: product?.productId })
      let history = []
      for (let _history of product?.history) {
        history.push({
          status: 'Order ' + _history?.status.toLowerCase(),
          date: _history?.date
        })
      }
      let currentStatus = product?.history?.pop()

      //Return validity check starts here
      let returnProps = { isReturnable: false, messgae: "Return not available" }
      const returnAvailable = productDetails?.product?.id?.return?.isPresent ? productDetails?.product?.id?.return?.isPresent : false
      if (returnAvailable) {
        returnProps = returnValidaty({
          createdAt: orderDetails?.createdAt,
          days: productDetails?.product?.id?.return?.value
        })
      }

      //Return validity check ends here
      console.log(orderDetails,"orderDetails")

      products.push({
        name: { text: productDetails?.name },
        thumbnail: { text: BASE_URL + productDetails?.thumbnail },
        quantity: { text: product?.quantity },
        attributes: productDetails?.attributes,
        price: { text: settings?.currency + " " + (Number(product?.pricePerUnit) || 0).toFixed(2) },
        params: { prodid: productDetails?.prodid, slug: productDetails?.slug },
        overView: { text: productDetails?.overview },
        status: { text: currentStatus?.status },
        date: { text: currentStatus?.date },
        history: history,
        review: { isAdded: review ? true : false },
        return: returnProps
      })
    }

    let response = {
      orderNo: { text: orderDetails?.orderNo },
      orderDate: { text: new Date(orderDetails?.createdAt) },
      orderTime: { value: orderDetails?.createdAt },
      updatedTime: { text: new Date(orderDetails?.updatedAt) },
      orderTotal: { text: settings?.currency + " " + orderDetails?.total },
      paymentMethod: { text: orderDetails?.paymentMethod },
      orderStatus: { text: orderDetails?.orderStatus },
      products: products,
      // address:{
      //   mobile:{text:orderDetails?.mobile},
      //   countrycode:{text:orderDetails?.countryCode},

      // },
      delivery: {
        customer: {
          name: { text: orderDetails?.customerId?.name || orderDetails?.guestId?.name || "" },
          mobile: { text: (orderDetails?.customerId?.countryCode || orderDetails?.guestId?.countryCode|| orderDetails?.address?.countryCode) + " " + (orderDetails?.address?.mobile || orderDetails?.customerId?.mobile || orderDetails?.guestId?.mobile) },
          email: { text: orderDetails?.customerId?.email || orderDetails?.guestId?.email || "" }
        },
        address: {
          lane: { text: [
            orderDetails?.address?.firstname +" " + orderDetails?.address?.lastname,
            orderDetails?.address?.type,
            orderDetails?.address?.countryCode + " " + orderDetails?.address?.mobile,
            orderDetails?.address?.email,
            orderDetails?.address?.additionalAddress,
            orderDetails?.address?.deliveryAddress,
            orderDetails?.address?.state,
            orderDetails?.address?.countryName

          ].filter(Boolean).join(", ") },
          city: { text: orderDetails?.address?.city + ", " + orderDetails?.address?.postalCode },
          // state: { text: orderDetails?.address?.state },
          countryCode:{text:orderDetails?.address?.countryCode},
          mobile:     {    text: orderDetails?.address?.countryCode+" "+   orderDetails?.address?.mobile }
        },
        shippingNote: { text: orderDetails?.shippingNote || "" }
      },
      orderPrice: {
        subtotal: { text: settings?.currency + " " + orderDetails?.subtotal },
        wholetotal: { text: settings?.currency + " " + orderDetails?.wholeTotal },
        shipping: { text: settings?.currency + " " + orderDetails?.shippingCharge },
        cod: { text: settings?.currency + " " + orderDetails?.codCost },
        discount: { text: settings?.currency + " " + orderDetails?.discount },
        additionalCharge: { text: settings?.currency + " " + orderDetails?.additionalCharge },
        tax: { text: settings?.currency + " " + ((orderDetails?.total - orderDetails?.discount) * 0.05).toFixed(2) },
        giftWrapTotal: { text: settings?.currency + " " + orderDetails?.giftWrapTotal, enabled: orderDetails?.giftWrapTotal > 0 ? true : false },
        total: { text: settings?.currency + " " + orderDetails?.total }
      },

      customerId: orderDetails?.customerId,
      customerType: orderDetails?.customerType,
      guestId: orderDetails?.guestId
    }
    return response
  } catch (error) {
    throw error;
  }
}

exports.getOrder = async (query, page, limit, projection = {}, sort = {}) => {
  try {
    const settings = await db.General.findOne()
    const revenuequery = [{
      '$project': { 'total': { '$toDouble': '$total' }, orderStatus: 1 }
    }, {
      $match: { orderStatus: 'DELIVERED' }
    }, {
      '$group': {
        '_id': 'Orders', 'totalRevenue': { '$sum': '$total' }, 'totalOrders': { '$sum': 1 }
      }
    }, {
      '$project': {
        'totalRevenue': 1, 'totalOrders': 1, 'averageSales': { '$divide': ['$totalRevenue', '$totalOrders'] }
      }
    }]

    const count = await db.Order.find(query).countDocuments();
    if (Math.ceil(count / limit) > 0 && Math.ceil(count / limit) < page) page = 1
    let orders = await db.Order.find(query, projection).limit(limit * 1).skip((page - 1) * limit).sort(sort)
      .populate([
        { path: "clickPoint", match: { _id: { $exists: true } } },
        { path: "deliverySlot", match: { _id: { $exists: true } } },
        { path: "deliveryTime", match: { _id: { $exists: true } } },
        { path: "guestId", match: { _id: { $exists: true } } },
        { path: "customerId", match: { _id: { $exists: true } } },
        { path: "products.productId", match: { _id: { $exists: true } } },
        { path: "history.created.user", match: { _id: { $exists: true } } },
        { path: "history.created.admin", match: { _id: { $exists: true } } },
      ]);

    const totalrevenue = await db.Order.aggregate(revenuequery);
    const totalRevenue = totalrevenue[0]?.totalRevenue ? totalrevenue[0]?.totalRevenue.toFixed(2) : '0.00'
    const averageSale = totalrevenue[0]?.averageSales ? totalrevenue[0]?.averageSales.toFixed(2) : '0.00'

    let result = {
      total_orders: count,
      total_revenue: `${settings?.currency} ${totalRevenue}`,
      average_sales: `${settings?.currency} ${averageSale}`,
      orders: orders ? orders : [],
      page: page,
      limit: limit,
      totalPages: Math.ceil(count / limit),
      totalResults: count,
      lastPage: (limit * page) > count ? true : false,
    };

    return result;
  } catch (error) {
    throw error;
  }
};

exports.getPendingOrder = async (obj, projection = {}) => {
  try {
    let order = await db.Order.find(obj, projection)
      .populate("customerId", "-_id name mobile email address")
      .populate(
        "product.productId",
        "-_id name mrpPrice offerPrice codCharge shippingCost taxClassId sku thumbnail"
      );
    return order;
  } catch (error) {
    throw error;
  }
};

exports.getOrderByOrderNo = async (number) => {
  try {
    let order = await db.Order.find({ orderNo: number })
      .populate("customerId", "_id name mobile email address userid")
      .populate("product.productId", "_id name price codCharge shippingCost taxClassId sku thumbnail");
    return order;
  } catch (error) {
    throw error;
  }
};

exports.getOrderDetails = async (query, projection = {}) => {
  try {
    let order = await db.Order.findOne(query, projection)
      .populate("customerId", "_id name mobile email address userid countryCode")
      .populate({
        path: "products.productId",
        select: "_id name price sku thumbnail attributes unit prodid slug stock",
      })
      .populate("deliveryTime", "_id from to")
      .populate("deliverySlot", "_id from to")
      .populate([
        { path: "guestId", match: { _id: { $exists: true } } },
        { path: "clickPoint", match: { _id: { $exists: true } } },
      ])
    return order;
  } catch (error) {
    throw error;
  }
};

exports.getRowOrderDetails = async (query, projection = {}) => {
  try {
    let order = await db.Order.findOne(query, projection);
    return order;
  } catch (error) {
    throw error;
  }
};

exports.getOrderByCustomer = async (customer) => {
  try {
    let order = await db.Order.find({ customerId: customer }).countDocuments();
    return order;
  } catch (error) {
    throw error;
  }
};

exports.updateOrder = async (order, data) => {
  try {
     console.log(order,data,"ddfewfwfjh bbjjkjkjnjknjkjnwkejefkjnwefjnwenjwfewefewfknefk 🍕🍕🍕")
    let orderDetails = await db.Order.findOneAndUpdate({ orderNo: order }, { $set: data }, {
      new: true,
      upsert: false,
      useFindAndModify: false,
    }).exec();
    return orderDetails;
  } catch (error) {
    throw error;
  }
};

exports.update = async (query, action) => {
  try {
    let order = await db.Order.updateOne(query, action, {
      new: true, upsert: false,
      useFindAndModify: false,
    }).exec();
    return order;
  } catch (error) {
    throw error;
  }
};

exports.updateOne = async (query, data) => {
  try {
    let order = await db.Order.updateOne(query, { $set: data }, {
      new: true, upsert: false,
      useFindAndModify: false,
    }).exec();
    return order;
  } catch (error) {
    throw error;
  }
};

exports.getOrderCount = async () => {
  try {
    let order = await db.Order.find({ orderStatus: { $ne: "PENDING" }, isDelete: false }).countDocuments();
    return order;
  } catch (error) {
    throw error;
  }
};

exports.getOrderCounts = async (query) => {
  try {
    let order = await db.Order.find(query).countDocuments();
    return order;
  } catch (error) {
    throw error;
  }
};

exports.searchOrder = async (query, page, limit) => {
  try {
    let order = await db.Order.find(query)
      .populate("customerId", "-_id name mobile email address")
      .populate(
        "product.productId",
        "-_id name mrpPrice offerPrice codCharge shippingCost taxClassId sku file"
      );
    let count = await db.Order.find(query).countDocuments();
    let result = {
      data: order,
      total: count,
    };
    return result;
  } catch (error) {
    throw error;
  }
};

exports.ordersCount = async () => {
  try {
    let order = await db.Order.find({ isDelete: false }).countDocuments();
    return order;
  } catch (error) {
    throw error;
  }
};

exports.ordersByProducts = async (product) => {
  try {
    let order = await db.Order.find({
      isDelete: false,
      isActive: true,
      "product.productId": product,
    }).populate('customerId', 'name');
    return order;
  } catch (error) {
    throw error;
  }
};

exports.getOrdersData = async (query, projection = {}) => {
  try {
    let order = await db.Order.find(query, projection).populate("product.productId", "_id name price sku thumbnail prodid");
    return order;
  } catch (error) {
    throw error;
  }
}

exports.getOrderData = async (query, projection = {}) => {
  try {
    let order = await db.Order.findOne(query, projection)
      .populate('customerId', 'name mobile address userid email deviceTokens')
      .populate({ path: 'products.productId', select: 'name price prodid thumbnail', populate: { path: 'product.id', select: '_id return' } })
      .populate("couponId", "_id name details couponid");
    return order;
  } catch (error) {
    throw error;
  }
}

exports.getOrdersByAgg = async (query) => {
  try {
    let orders = await db.Order.aggregate(query)
    return orders;
  } catch (error) {
    throw error;
  }
}

exports.getOrdersByAggregate = async (query) => {
  try {
    let orders = await db.Order.aggregate(query)
    return orders;
  } catch (error) {
    throw error;
  }
}

exports.getLatestOrders = async (query, limit, projection = {}) => {
  try {
    let order = await db.Order.find(query, projection).sort({ createdAt: 1 }).limit(limit).populate('customerId', 'name mobile address');
    return order;
  } catch (error) {
    throw error;
  }
}

exports.getAllLatestOrders = async (query, limit, projection = {}) => {
  try {
    let order = await db.Order.find(query, projection).sort({ _id: -1 })
      .populate('customerId', 'name mobile address')
      .populate("product.productId", "_id name price sku thumbnail prodid");
    return order;
  } catch (error) {
    throw error;
  }
}

exports.getLatestOrdersByPage = async (query, limit, page, projection = {}) => {
  try {
    let order = await db.Order.find(query, projection).sort({ _id: -1 }).limit(limit * 1).skip((page - 1) * limit).populate('customerId', 'name mobile address');
    return order;
  } catch (error) {
    throw error;
  }
}
// exports.getOrderShippingNumber = async (orderNumbers) => {
//   console.log(Array.isArray(orderNumbers),"order nu,bersd   jhshdbfks")
//   try {
//     if (!orderNumbers || !Array.isArray(orderNumbers)) {
//       return [];
//     }

//     // Find orders with matching order numbers
//     const orders = await db.Order.find({ 
//       orderNo: { $in: orderNumbers },
//       isDelete: false 
//     });
//     console.log(orders,"orders")

//     // Extract all shipment numbers from products
//     const shipmentNumbers = [];
//     orders.forEach(order => {
//       order.products.forEach(product => {
//         if (product.shipmentNumber && !shipmentNumbers.includes(product.shipmentNumber)) {
//           shipmentNumbers.push(product.shipmentNumber);
//         }
//       });
//     });

//     return shipmentNumbers;
//   } catch (error) {
//     throw error;
//   }
// };
exports.getOrderShippingNumber = async (orderNumbers) => {
  console.log(Array.isArray(orderNumbers), "order numbers check");
  try {
    if (!orderNumbers || !Array.isArray(orderNumbers)) {
      return [];
    }

    // Add # before each order number
    const prefixedOrderNumbers = orderNumbers.map(num => `#${num}`);

    // Find orders with matching prefixed order numbers
    const orders = await db.Order.find({ 
      orderNo: { $in: prefixedOrderNumbers },
      isDelete: false 
    });
    console.log(orders, "orders");

    // Extract all shipment numbers from products
    const shipmentNumbers = [];
    orders.forEach(order => {
      if (order.products && Array.isArray(order.products)) {
        order.products.forEach(product => {
          if (product.shipmentNumber && !shipmentNumbers.includes(product.shipmentNumber)) {
            shipmentNumbers.push(product.shipmentNumber);
          }
        });
      }
    });

    return shipmentNumbers;
  } catch (error) {
    console.error("Error in getOrderShippingNumber:", error);
    throw error;
  }
};