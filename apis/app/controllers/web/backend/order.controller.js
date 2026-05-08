const helper = require("../../../../util/responseHelper");
const { body, validationResult } = require("express-validator");
const messages = require("../../../../config/constants").messages;
const service = require("../../../services/order.service");
const guestCustomerService = require("../../../services/guest.customer.service");
const productService = require("../../../services/product.service");
const productHeadService = require("../../../services/product.head.service");
const guestService = require("../../../services/guest.customer.service");
const customerService = require("../../../services/customer.service");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const fs = require("fs");
const mailer = require("../../../../util/sendMail");
const settingsService = require("../../../services/general.settings.service");
const templates = require("../../../../util/templates");
const helpService = require("../../../services/help.center.service");
const { BASE_URL } = require("../../../../config/constants/common");
const admin = require("firebase-admin");
const notificationService = require("../../../services/notification.service");
const activity = require("../../../../util/activity.creator");
const { months } = require("../../../../util/months");
const shippingUtility = require("../../../../util/shippingCalculation");
const db = require("../../web/../../db/index");
const AWS = require("aws-sdk");
const { uid } = require("uid/secure");
const { sendMail } = require("../../../../util/sendMail");
const PostShippingService = require("../../../../util/shipping")

const { calculateShippingRates } = require("../../../../util/shipping/calculateShippingRates");
const { handleShipmentCreation, createShipment } = require("../../../../util/shipping/createShipping");
//order controller  calculate rates
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

exports.validate = (method) => {
  switch (method) {
    case "create": {
      return [
        body("products", "product is required").exists(),
        body("customerId", "Customer is required").exists(),
      ];
    }
    case "update": {
      return [body("order", "Order number is required").exists()];
    }
    case "cancel": {
      return [body("order", "Order number is required").exists()];
    }
    case "manage-tags": {
      return [
        body("order", "Order is required").exists(),
        body("tag", "Tag is required").exists(),
      ];
    }
    case "update-status": {
      return [
        body("order", "Order number is required").exists(),
        body("product", "Product is required").exists(),
        body("status", "Status is required").exists(),
      ];
    }
    case "update-dates": {
      return [
        body("order", "Order number is required").exists(),
        body("product", "Product is required").exists(),
      ];
    }
  }
};

exports.bulkOrders = async (req, res) => {
  try {
    const { body } = req;
    let orders = [];
    for (let order of body.orders) {
      const orderDetails = await service.getOrderDetails({ orderNo: order });
      if (orderDetails) {
        orders.push(orderDetails);
      }
    }
    helper.deliverResponse(res, 200, orders, {
      error_code: messages.successResponse.error_code,
      error_message: messages.successResponse.error_message,
    });
  } catch (error) {
    helper.deliverResponse(res, 422, error, {
      error_code: messages.serverError.error_code,
      error_message: messages.serverError.error_message,
    });
  }
};

exports.create = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return helper.deliverResponse(
        res,
        422,
        errors,
        messages.VALIDATION_ERROR
      );
    }

    let { body } = req;
    let baseTotal = 0;
    let taxTotal = 0;
    let wholeTotal = 0;
    let discountTotal = 0;
    let subTotal = 0;
    let total = 0;
    let codCharges = [];
    let products = [];

    let charges = [];

    body.orderNo = "#" + 10000 + (await service.ordersCount());
    const invoiceItems = await db.Invoice.find({});
    const invoiceDetails = invoiceItems.pop();
    body["invoiceNo"] =
      invoiceDetails?.code +
      Number(invoiceDetails?.startingRange) +
      (await service.getOrderCounts({}));
    body.orderStatus = "PLACED";
    body.orderDate = new Date();
    body.refid = uid();

    const productIds = body.products.map((product) => product._id);
    const productItems = await db.Product.find({ _id: { $in: productIds } });
    let productsMap = {};
    productItems.forEach((product) => {
      productsMap[product._id] = product;
    });

    for (let product of body.products) {
      const productDetails = productsMap[product._id];
      if (productDetails) {
        const totalPrice = product.quantity * productDetails.price.selling;
        const taxRate = 1.05;
        const totalPriceWithoutTax = totalPrice / taxRate;
        const totalTax = totalPrice - totalPriceWithoutTax;

        baseTotal += totalPriceWithoutTax;
        taxTotal += totalTax;
        wholeTotal += Number(product.quantity) * Number(productDetails.price.selling);
        subTotal += totalPrice;
        total +=product.quantity * productDetails.price.mrp
        discountTotal +=
          (productDetails.price.mrp - productDetails.price.selling) *
          product.quantity;

        products.push({
          productId: productDetails?._id,
          quantity: product?.quantity,
          baseTotal: Number(totalPriceWithoutTax.toFixed(2)),
          discountTotal: Number(
            (
              (productDetails.price.mrp - productDetails.price.selling) *
              product.quantity
            ).toFixed(2)
          ),
          mrpTotal: Number(
            (productDetails.price.mrp * product.quantity).toFixed(2)
          ),
          taxTotal: Number(totalTax.toFixed(2)),
          total: Number(totalPrice.toFixed(2)),
          pricePerUnit: Number(productDetails?.price?.selling.toFixed(2)),
          history: [{ status: "PLACED", date: new Date().toISOString() }],
        });
      }
    }

    body.products = products;

    body.priceBeforeTax = baseTotal.toFixed(2);
    body.tax = taxTotal.toFixed(2);
    body.discount = discountTotal.toFixed(2);
    body.priceAfterTax = subTotal.toFixed(2);
    body.wholeTotal = wholeTotal.toFixed(2);
    body.subtotal = subTotal.toFixed(2);
    body.total = total;

    if (body.coupon) {     
      const couponDetails = await db.Coupon.findOne({ code: body.coupon });
      if (couponDetails) {
        if (couponDetails.type == "percent") {
          body.couponDiscount = (body.total * couponDetails.value) / 100;
          body.total = body.total - (body.total * couponDetails.value) / 100;
        } else {
          body.couponDiscount = couponDetails.value;
          body.total = body.total - couponDetails.value;
        }
        body.coupon = couponDetails.code;
      }
    }else{
      delete body.coupon;
    }

    if (body?.additionalCharge) {
      body.wholeTotal = Number(body.wholeTotal) + Number(body.additionalCharge);
      body.additionalCharge = Number(body.additionalCharge).toFixed(2);
    }

    body.source = "ADMIN";

    let totalWithshippingCharge = await shippingUtility.calculation(
      charges,
      body.wholeTotal
    );
    if (totalWithshippingCharge.shippingCharge > 0) {
      body.wholeTotal = totalWithshippingCharge.amount;
      body.shippingCost = totalWithshippingCharge.shippingCharge.toFixed(2);
    }

    if (body["paymentMethod"] == "ONLINE" && body["transactionId"] != "") {
      body.paymentStatus = "PAID";
      body.payment = { referenceId: body?.transactionId };
      body.wholeTotal = body.wholeTotal.toFixed(2);
      console.log("bodybody",body);
      
      if (!body.coupon) {
        delete body.coupon;
      }
      const orderDetails = await service.createOrder(body);
      if (orderDetails instanceof Error) {
        helper.deliverResponse(res, 422, {}, messages.serverError);
      } else {
        for (let product of body?.products) {
          const productDetails = await productService.getSingleProduct({
            _id: product?._id,
            isActive: true,
            isDelete: false,
            isArchive: false,
          });
          if (productDetails) {
            await productService.updateProduct(
              { _id: product?._id },
              {
                stock:
                  productDetails.stock - product.quantity < 0
                    ? 0
                    : productDetails.stock - product.quantity,
              }
            );
          }
        }

        helper.deliverResponse(res, 200, orderDetails, messages.ORDER_PLACED);
      }
    } else if (body["paymentMethod"] == "COD") {
      body.paymentStatus = "PENDING";

      //Cod cost calculation
      if (codCharges.length > 0) {
        let codCharge = Math.max(...codCharges);
        body.codCost = codCharge.toFixed(2);
        body.total = body.total + Number(codCharge);
      }
      //Cod cost calculation

      body.total = body.total.toFixed(2);

            const orderDetails = await service.createOrder(body);
            if (orderDetails instanceof Error) {
                return helper.deliverResponse(res, 422, {}, messages.serverError);
            } else {
                for (let product of body?.products) {
                    const productDetails = productsMap[product?._id]
                    if (productDetails) {
                        await productService.update(
                            { _id: product?._id },
                            { stock: productDetails.stock - product.quantity < 0 ? 0 : productDetails.stock - product.quantity }
                        )
                    }
                }

                return helper.deliverResponse(res, 200, orderDetails, messages.ORDER_PLACED);
            }
        } else {
            return helper.deliverResponse(res, 200, {}, messages.TRANSACTIONID_REQUIRED);
        }
    } catch (error) {
        console.log('Error caught in create order from backend :: ' + error);
        return helper.deliverResponse(res, 422, error, messages.serverError);
    }
};

exports.getOrder = async (req, res) => {
  try {
    const { body } = req;
    let data = { isDelete: false };
    if (body?.status) data.orderStatus = body?.status;
    if (body?.paymentMethod) data.paymentMethod = body?.paymentMethod;
    if (body?.source) data.source = body?.source;
    if (body?.paymentStatus) data.paymentStatus = body?.paymentStatus;
    if (body?.fromDate)
      data.orderDate = {
        $gte: new Date(new Date(body?.fromDate).setHours(0, 0, 0, 0)),
      };
    if (body?.toDate)
      data.orderDate = {
        $lte: new Date(new Date(body?.toDate).setHours(23, 59, 59, 999)),
      };
    if (body?.fromDate && body?.toDate)
      data.orderDate = {
        $gte: new Date(new Date(body?.fromDate).setHours(0, 0, 0, 0)),
        $lte: new Date(new Date(body?.toDate).setHours(23, 59, 59, 999)),
      };
    let customers = [];
    const users = await customerService.getClient({
      name: { $regex: body?.keyword, $options: "i" },
    });
    for (let user of users) customers.push(user?._id);
    if (body?.keyword)
      data["$or"] = [
        { orderNo: { $regex: body?.keyword, $options: "i" } },
        { customerId: { $in: customers } },
      ];
    const projection = {
      orderNo: 1,
      guestId: 1,
      deliverySlot: 1,
      clickPoint: 1,
      deliveryDate: 1,
      customerType: 1,
      customerId: 1,
      orderTime: 1,
      orderDate: 1,
      total: 1,
      wholeTotal: 1,
      createdAt: 1,
      orderStatus: 1,
      paymentMethod: 1,
      paymentStatus: 1,
      refid: 1,
      source: 1,
      tags: 1,
    };
    const order = await service.getOrder(
      data,
      body?.page,
      body?.limit,
      projection,
      { createdAt: -1 }
    );
    helper.deliverResponse(res, 200, order, {
      error_code: messages.successResponse.error_code,
      error_message: messages.successResponse.error_message,
    });
  } catch (error) {
    helper.deliverResponse(
      res,
      422,
      {},
      {
        error_code: messages.serverError.error_code,
        error_message: messages.serverError.error_message,
      }
    );
  }
};

exports.getPendingOrder = async (req, res) => {
  try {
    const order = await service.getPendingOrder({ orderStatus: "PENDING" });
    helper.deliverResponse(res, 200, order);
  } catch (error) {
    helper.deliverResponse(
      res,
      422,
      {},
      {
        error_code: messages.serverError.error_code,
        error_message: messages.serverError.error_message,
      }
    );
  }
};

exports.getPendingOrderByNumber = async (req, res) => {
    try {
        const { number } = req.query;
        const order = await service.getPendingOrder({
            orderStatus: "PENDING",
            refid: number,
        });
        helper.deliverResponse(res, 200, order);
    } catch (error) {
        helper.deliverResponse(res, 422, {}, {
            error_code: messages.serverError.error_code,
            error_message: messages.serverError.error_message,
        });
    }
};

exports.getActiveOrder = async (req, res, next) => {
    try {
        const order = await service.getOrder({ isDelete: false, isActive: true });
        helper.deliverResponse(res, 200, order);
    } catch (error) {
        helper.deliverResponse(res, 422, {}, {
            error_code: messages.serverError.error_code,
            error_message: messages.serverError.error_message,
        });
    }
};

exports.getOrderDetails = async (req, res) => {
    try {
        const { body } = req;
        const response = await service.getOrderDetails({ orderNo: body?.order });
        helper.deliverResponse(res, 200, response, {
            error_code: messages.successResponse.error_code,
            error_message: messages.successResponse.error_message,
        });
    } catch (error) {
        helper.deliverResponse(res, 422, {}, {
            error_code: messages.serverError.error_code,
            error_message: messages.serverError.error_message,
        });
    }
};

exports.orderPaymentAcceptance = async (req, res) => {
  try {
    const { order } = req.query;
    const orderDetails = await service.getOrderDetails({
      orderNo: `#${order}`,
    });
    for (let product of orderDetails?.products) {
      await service.updateOne(
        { orderNo: `#${order}`, "products.productId": product?.productId?._id },
        {
          "products.$.paymentStatus": "PAID",
        }
      );
    }

        const orderResponse = await service.updateOne({ orderNo: `#${order}` }, { orderStatus: 'PLACED', paymentStatus: 'PAID' })
        if (orderResponse instanceof Error) {
            helper.deliverResponse(res, 422, orderResponse, {
                error_code: messages.serverError.error_code,
                error_message: messages.serverError.error_message,
            });
        } else {
            helper.deliverResponse(res, 200, orderResponse, {
                error_code: messages.ORDER_PAYMENT_ACCEPTED.error_code,
                error_message: messages.ORDER_PAYMENT_ACCEPTED.error_message,
            });
        }
    } catch (error) {
        console.log("Error caught in order payment acceptance API :: " + error)
        helper.deliverResponse(res, 422, error, {
            error_code: messages.serverError.error_code,
            error_message: messages.serverError.error_message,
        });
    }
}

exports.getOrderByRefid = async (req, res) => {
    try {
        const { number } = req.query;
        const order = await service.getOrder({ refid: number });
        helper.deliverResponse(res, 200, order);
    } catch (error) {
        helper.deliverResponse(res, 422, {}, {
            error_code: messages.serverError.error_code,
            error_message: messages.serverError.error_message,
        });
    }
};

exports.updateOrder = async (req, res) => {
    try {
        let { body } = req;
        const orderResponse = await service.updateOrder(body?.order, body);
        if (orderResponse instanceof Error) {
            helper.deliverResponse(res, 422, orderResponse, {
                error_code: messages.serverError.error_code,
                error_message: messages.serverError.error_message,
            });
        } else {
            helper.deliverResponse(res, 200, orderResponse, {
                error_code: messages.ORDER_UPDATED.error_code,
                error_message: messages.ORDER_UPDATED.error_message,
            });
        }
    } catch (error) {
        console.log('Error caught in update order API :: ' + error);
        helper.deliverResponse(res, 422, {}, {
            error_code: messages.serverError.error_code,
            error_message: messages.serverError.error_message,
        });
    }
};

// exports.trackOrderProducts = async (req, res) => {
//   try {
//     const { orderNo } = req.body;

//     const order = await db.Order.findOne({ orderNo }).populate("products.productId", "_id name");

//     if (!order) {
//       return helper.deliverResponse(res, 404, {}, {
//         error_code: messages.serverError.error_code,
//         error_message: "Order not found",
//       });
//     }

//     let updates = [];
//     for (let product of order.products) {
//       if (product.shipmentNumber) {
//         const trackingData = await PostShippingService.getTrackingDetails(product.shipmentNumber);
//         if (trackingData?.trackingStatus && trackingData?.trackingDate) {
//           updates.push({
//             updateOne: {
//               filter: { _id: order._id, "products._id": product._id },
//               update: {
//                 $push: {
//                   "products.$.history": {
//                     status: trackingData.trackingStatus,
//                     date: trackingData.trackingDate,
//                   },
//                 },
//               },
//             },
//           });
//         }
//       }
//     }

//     if (updates.length > 0) {
//       await db.Order.bulkWrite(updates);
//     }

//     return helper.deliverResponse(res, 200, { message: "Tracking updated successfully" }, {
//       error_code: messages.successResponse.error_code,
//       error_message: messages.successResponse.error_message,
//     });

//   } catch (error) {
//     console.error("Error updating tracking:", error);
//     return helper.deliverResponse(res, 500, {}, {
//       error_code: messages.serverError.error_code,
//       error_message: messages.serverError.error_message,
//     });
//   }
// };
// exports.trackOrderProducts = async (req, res) => {
//   try {
//     const { orderNo } = req.body;
    
//     const order = await db.Order.findOne({ orderNo }).populate("products.productId", "_id name");
    
//     if (!order) {
//       return helper.deliverResponse(res, 404, {}, {
//         error_code: messages.serverError.error_code,
//         error_message: "Order not found",
//       });
//     }
    
//     let updates = [];
    
//    for (let product of order.products) {
//   // if (product.shipmentNumber) {
//   // Use product.shipmentNumber in production instead of hardcoded value
//   const trackingEvents = await PostShippingService.getTrackingDetails("dd");
//   console.log("trackingEvents:", trackingEvents);
  
//   if (trackingEvents && trackingEvents.length > 0) {
//     const history = product.history || [];
    
//     // Create a set of existing statuses in history
//     const existingStatuses = new Set(history.map(item => item.status));
    
//     // Group tracking events by status and keep only the latest of each status
//     const latestStatusEvents = new Map();
    
//     // Parse dates properly and sort events by date (newest first)
//     const sortedEvents = [...trackingEvents].sort((a, b) => {
//       // Handle date strings in format '2025/04/18 08:38:00 AM'
//       const dateA = new Date(a.trackingDate);
//       const dateB = new Date(b.trackingDate);
//       return dateB - dateA; // Newest first
//     });
    
//     // Keep only the latest event for each status
//     for (const event of sortedEvents) {
//       const status = event.trackingStatus;
//       if (!latestStatusEvents.has(status)) {
//         latestStatusEvents.set(status, event);
//       }
//     }
    
//     const newEvents = [];
    
//     // Define the event code mappings
//     const attemptedDeliveryCodes = new Set([16, 18, 43, 44, 60, 85, 106, 107]);
//     const orderRejectedCode = 39;
//     const returnedToSenderCodes = new Set([56]);
    
//     // Only add statuses that don't already exist in history
//     for (const [status, event] of latestStatusEvents.entries()) {
//       if (!existingStatuses.has(status)) {
//         let mappedStatus = event.trackingStatus;
//         let description = event.trackingDescription;
        
//         // Check event codes and map to appropriate status
//         const eventCode = parseInt(event.trackingEventCode);
        
//         if (attemptedDeliveryCodes.has(eventCode)) {
//           mappedStatus = "Attempted Delivery";
//           description = `Attempted Delivery - ${event.trackingDescription}`;
//         } else if (eventCode === orderRejectedCode) {
//           mappedStatus = "Order Rejected";
//         } else if (returnedToSenderCodes.has(eventCode)) {
//           mappedStatus = "Returned";
//           description = `Returned to Sender - ${event.trackingDescription}`;
//         }
        
//         newEvents.push({
//           status: mappedStatus,
//           date: event.trackingDate,
//           eventCode: event.trackingEventCode,
//           description: description
//         });
//       }
//     }
    
//     // Sort new events by date (oldest first) for chronological order in history
//     newEvents.sort((a, b) => {
//       const dateA = new Date(a.date);
//       const dateB = new Date(b.date);
//       return dateA - dateB; // Oldest first
//     });
    
//     // Add any new events to history
//     if (newEvents.length > 0) {
//       updates.push({
//         updateOne: {
//           filter: { _id: order._id, "products._id": product._id },
//           update: {
//             $push: {
//               "products.$.history": {
//                 $each: newEvents
//               }
//             }
//           }
//         }
//       });
//     }
//   }
//   //  }
// }
//     if (updates.length > 0) {
//       await db.Order.bulkWrite(updates);
//     }
    
//     return helper.deliverResponse(res, 200, { message: "Tracking updated successfully" }, {
//       error_code: messages.successResponse.error_code,
//       error_message: messages.successResponse.error_message,
//     });
//   } catch (error) {
//     console.error("Error updating tracking:", error);
//     return helper.deliverResponse(res, 500, {}, {
//       error_code: messages.serverError.error_code,
//       error_message: messages.serverError.error_message,
//     });
//   }
// };
exports.trackOrderProducts = async (req, res) => {
  try {
    const { orderNo } = req.body;
    
    const order = await db.Order.findOne({ orderNo }).populate("products.productId", "_id name");
    
    if (!order) {
      return helper.deliverResponse(res, 404, {}, {
        error_code: messages.serverError.error_code,
        error_message: "Order not found",
      });
    }
    
    let updates = [];
    
    for (let product of order.products) {
      if (product.shipmentNumber) {
      const trackingEvents = await PostShippingService.getTrackingDetails(product.shipmentNumber);
      console.log("trackingEvents:", trackingEvents);
      
      if (trackingEvents && trackingEvents.length > 0) {
        const history = product.history || [];
        
        // Process existing history to remove duplicates (keep only latest of each status)
        const statusMap = new Map();
        history.forEach(item => {
          statusMap.set(item.status, item);
        });
        
        const uniqueHistory = Array.from(statusMap.values()).sort((a, b) => {
          return new Date(a.date) - new Date(b.date); // Oldest first
        });
        
        const latestHistoryStatus = uniqueHistory.length > 0 
          ? uniqueHistory[uniqueHistory.length - 1].status 
          : null;
        
        // Process tracking events
        const latestStatusEvents = new Map();
        const sortedEvents = [...trackingEvents].sort((a, b) => {
          const dateA = new Date(a.trackingDate);
          const dateB = new Date(b.trackingDate);
          return dateB - dateA; // Newest first
        });
        
        for (const event of sortedEvents) {
          const status = event.trackingStatus;
          if (!latestStatusEvents.has(status)) {
            latestStatusEvents.set(status, event);
          }
        }
        
        // Map event codes to special statuses
        const newEvents = [];
        const attemptedDeliveryCodes = new Set([16, 18, 43, 44, 60, 85, 106, 107]);
        const orderRejectedCode = 39;
        const returnedToSenderCodes = new Set([56]);
        
        for (const [status, event] of latestStatusEvents.entries()) {
          let mappedStatus = status;
          let description = event.trackingEventName;
          const eventCode = parseInt(event.trackingEventCode);
          
          if (attemptedDeliveryCodes.has(eventCode)) {
            mappedStatus = "Attempted Delivery";
            description = `Attempted Delivery - ${event.trackingEventName}`;
          } else if (eventCode === orderRejectedCode) {
            mappedStatus = "Order Rejected";
          } else if (returnedToSenderCodes.has(eventCode)) {
            mappedStatus = "Returned";
            description = `Returned to Sender - ${event.trackingEventName}`;
          }
          
          const existingStatusItem = statusMap.get(mappedStatus);
          const eventDate = new Date(event.trackingDate);
          
          if (!existingStatusItem || 
              new Date(existingStatusItem.date) < eventDate ||
              existingStatusItem.description !== description) {
            
            newEvents.push({
              status: mappedStatus,
              date: event.trackingDate,
              eventCode: event.trackingEventCode,
              description: description
            });
          }
        }
        
        newEvents.sort((a, b) => {
          return new Date(a.date) - new Date(b.date);
        });
        
        const latestNewStatus = newEvents.length > 0 
          ? newEvents[newEvents.length - 1].status 
          : null;
        
        const shouldUpdate = newEvents.length > 0 && (
          !latestHistoryStatus || 
          latestNewStatus !== latestHistoryStatus
        );
        
        if (shouldUpdate) {
          // First get the current history
          const currentHistory = product.history || [];
          
          // Remove any entries with statuses we're about to update
          const statusesToUpdate = new Set(newEvents.map(e => e.status));
          const filteredHistory = currentHistory.filter(
            item => !statusesToUpdate.has(item.status)
          );
          
          // Combine the filtered history with new events
          const updatedHistory = [...filteredHistory, ...newEvents]
            .sort((a, b) => new Date(a.date) - new Date(b.date));
          
          updates.push({
            updateOne: {
              filter: { _id: order._id, "products._id": product._id },
              update: {
                $set: {
                  "products.$.history": updatedHistory
                }
              }
            }
          });
        }
      }
    }
  }
    
    if (updates.length > 0) {
      await db.Order.bulkWrite(updates);
    }
    
    return helper.deliverResponse(res, 200, { message: "Tracking updated successfully" }, {
      error_code: messages.successResponse.error_code,
      error_message: messages.successResponse.error_message,
    });
  } catch (error) {
    console.error("Error updating tracking:", error);
    return helper.deliverResponse(res, 500, {}, {
      error_code: messages.serverError.error_code,
      error_message: messages.serverError.error_message,
    });
  }
};
exports.requestPickUp= async (req, res)=>{
 try{ 
  console.log(req.body)
  const orderShippingNumber = await service.getOrderShippingNumber(req.body) 
  console.log("orderShippingNumber",orderShippingNumber)
  const trackingData = await PostShippingService.requestPickup(orderShippingNumber) 
  if (!trackingData) {
    throw new Error("Tracking data is null or undefined");
  }
  return helper.deliverResponse(res, 200, { message: "Tracking requested successfully" }, {
    error_code: messages.successResponse.error_code,
    error_message: messages.successResponse.error_message,
  });
 }
 catch (error) {
    console.error("Error request pickup:", error);
    return helper.deliverResponse(res, 500, {}, {
      error_code: messages.serverError.error_code,
      error_message: messages.serverError.error_message,
    });
  }
}

exports.cancelOrderDetails = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      helper.deliverResponse(res, 422, errors, {
        error_code: messages.VALIDATION_ERROR.error_code,
        error_message: messages.VALIDATION_ERROR.error_message,
      });
      return;
    }

        const { body } = req
        const settings = await settingsService.findOne({})
      
        const helpDetails = await helpService.findOne()
        const orderDetails = await service.getOrderDetails({ orderNo: body?.order })
        const guestDetails = await guestService.findGuestById(orderDetails?.guestId)

        const orderResponse = await service.updateOrder(body.order, { orderStatus: 'CANCELLED', cancel: { reason: body?.reason, date: new Date().toUTCString() } })
        if (orderResponse instanceof Error) {
            helper.deliverResponse(res, 422, orderResponse, {
                error_code: messages.serverError.error_code,
                error_message: messages.serverError.error_message,
            });
        } else {
            //Update product order status to cancelled and update stock
            for (let product of orderDetails?.products) {
                const isDeliveryExists = product?.history?.some((history) => history.status == 'DELIVERED')
                if (isDeliveryExists == true) {

                } else {
                    await service.updateOne({ orderNo: body.order, 'products.productId': product?.productId?._id }, {
                        'products.$.history': [...product?.history, { status: 'CANCELLED', date: new Date().toUTCString() }]
                    })

                    await productService.findByIdAndUpdate({ _id: product?.productId?._id }, { $inc: { stock: Number(product?.quantity) } })
                }
            }

      const cancelledSubject = `Your order ${orderResponse?.orderNo} has been cancelled`;
      const cancelledContent = `Your order ${orderResponse?.orderNo} has been cancelled`;
      const customerDetails = await customerService.getCustomer({
        _id: orderResponse.customerId,
      });
      const templateData = {
        orderNo: orderResponse.orderNo,
        orderDate: orderResponse.orderDate,
        customerName: customerDetails?.name || guestDetails?.firstName,
        storeName: settings.name,
        orderTotal: settings.currency + " " + orderResponse.total,
        supportEmail: helpDetails?.email,
        supportPhone: helpDetails?.phone,
        primaryColor: "#000000",
        logoUrl: BASE_URL + settings.logo,
        downloadUrl:
          BASE_URL + "api/v1/w/invoice/" + orderResponse.orderNo.split("#")[1],
      };
      const cancelledTemplate = await templates.orderCancelled(templateData);
      await mailer.sendMail(
        customerDetails?.email || guestDetails?.email,
        cancelledSubject,
        cancelledContent,
        cancelledTemplate
      );

            helper.deliverResponse(res, 200, orderResponse, {
                error_code: messages.ORDER_CANCELLED.error_code,
                error_message: messages.ORDER_CANCELLED.error_message,
            });
        }
    } catch (error) {
        console.log('Error caught in cancel order API :: ' + error);
        helper.deliverResponse(res, 422, error, {
            error_code: messages.serverError.error_code,
            error_message: messages.serverError.error_message,
        });
    }
}

exports.orderCount = async (req, res) => {
    try {
        const count = await service.getOrderCount();
        helper.deliverResponse(res, 200, count);
    } catch (error) {
        helper.deliverResponse(res, 422, {}, {
            error_code: messages.serverError.error_code,
            error_message: messages.serverError.error_message,
        });
    }
};

exports.getDetailedOrderReport = async (req, res) => {
  try {
    let orders = await service.getOrders({ isDelete: false });
    let headers = [
      { id: "orderNo", title: "Order No" },
      { id: "createdtAt", title: "Created" },
      { id: "deliveredAt", title: "Delivered" },
      { id: "subtotal", title: "Sub Total" },
      { id: "discount", title: "Discount" },
      { id: "codCost", title: "COD" },
      { id: "additionalCharge", title: "Additional" },
      { id: "total", title: "Total" },
      { id: "paymentMethod", title: "Payment Method" },
      { id: "orderStatus", title: "Status" },
      { id: "source", title: "Source" },
      { id: "name", title: "Name" },
      { id: "category", title: "Category" },
      { id: "brand", title: "Brand" },
      { id: "sku", title: "SKU" },
      { id: "unit", title: "Unit" },
      { id: "quantity", title: "Quantity" },
      { id: "pricePerUnit", title: "Price Per Unit" },
      { id: "mrp", title: "MRP" },
      { id: "offerPrice", title: "Offer Price" },
      { id: "sellingPrice", title: "Selling Price" },
      { id: "billingName", title: "Billing Name" },
      { id: "shippingName", title: "Shipping Name" },
      { id: "shippingAddress", title: "Shipping Address" },
      { id: "shippingPhone", title: "Shipping Phone" },
      { id: "billingAddress", title: "Billing Address" },
      { id: "billingPhone", title: "Billing Phone" },
      { id: "state", title: "State" },
      { id: "city", title: "City" },
      { id: "country", title: "Country" },
      { id: "email", title: "Email" },
      { id: "mobile", title: "Mobile" },
      { id: "countryCode", title: "Country Code" },
    ];

    const csvWriter = createCsvWriter({
      path: "detailed_order_report.csv",
      header: headers,
    });

    let orderDetails = [];

    for (let order of orders) {
      for (let product of order?.products) {
        let productDetails = await productService.getProductDetails({
          _id: product?.productId?._id,
        });
        const productHeadDetails = await productHeadService.findOne({
          _id: productDetails?.product?.id?._id,
        });
        orderDetails.push({
          orderNo: order?.orderNo,
          createdtAt: new Date(order?.createdAt).toDateString(),
          deliveredAt: "",
          subtotal: order?.priceBeforeTax,
          discount: order?.discount,
          total: order?.total,
          name: productDetails?.name,
          mrp: productDetails?.price?.mrp,
          sellingPrice: productDetails?.price?.selling,
          offerPrice: productDetails?.price?.offer,
          sku: productDetails?.sku,
          email: order?.customerId?.email,
          mobile: order?.customerId?.mobile,
          countryCode: order?.customerId?.countryCode,
          orderStatus: order?.orderStatus,
          paymentMethod: order?.paymentMethod,
          source: order?.source,
          quantity: product?.quantity,
          brand: productHeadDetails?.brand?.name,
          unit: productDetails?.unit,
          pricePerUnit: product?.pricePerUnit,
        });
      }
    }

        csvWriter.writeRecords(orderDetails)
            .then(() => {
                res.setHeader('Content-disposition', 'attachment; filename=detailed_order_report.csv');
                res.setHeader('Content-type', 'text/csv');
                res.status(200).download(process.cwd() + '/detailed_order_report.csv', () => {
                    fs.unlink(process.cwd() + '/detailed_order_report.csv', (err) => { })
                });
            })
            .catch((error) => {
                res.status(500).send("Internal Server Error");
            });
    } catch (error) {
        console.log('Error caught in download detailed order report API :: ' + error)
        helper.deliverResponse(res, 422, {}, {
            error_code: messages.serverError.error_code,
            error_message: messages.serverError.error_message,
        });
    }
};

exports.getOrderDetailedReport = async (req, res) => {
    try {
        const order = await service.getAllOrder({});
        const response = [];
        for (let data of order) {
            response.push({
                ordernumber: data.orderNo,
                orderdate: new Date(data.orderDate).toDateString(),
                orderstatus: data.orderStatus,
                paymentmethod: data.paymentMethod,
                tax: data.tax,
                shippingcost: data.shippingCost,
                total: data.total,
                customer: data.customerId.name,
                totalitems: data.product.length,
            });
        }
        helper.deliverResponse(res, 200, response);
    } catch (_err) {
        helper.deliverResponse(res, 422, {}, {
            error_code: messages.serverError.error_code,
            error_message: messages.serverError.error_message,
        });
    }
};

exports.searchOrder = async (req, res) => {
    try {
        const { body } = req;
        let data = {};
        for (let _key of Object.keys(body)) {
            if (body[_key] != "") {
                data[_key] = body[_key];
            }
        }
        if (data["fdate"] && data["tdate"]) {
            data["orderDate"] = {
                $gte: new Date(new Date(data["fdate"]).toUTCString()),
                $lte: new Date(new Date(data["tdate"]).toUTCString()),
            };
            delete data["fdate"];
            delete data["tdate"];
        } else if (data["fdate"]) {
            data["orderDate"] = {
                $gte: new Date(new Date(data["fdate"]).toUTCString()),
            };
            delete data["fdate"];
        } else if (data["tdate"]) {
            data["orderDate"] = {
                $lte: new Date(new Date(data["tdate"]).toUTCString()),
            };
            delete data["tdate"];
        }
        data["isDelete"] = false;
        if (!data["orderStatus"]) {
            data["orderStatus"] = { $ne: "PENDING" };
        }
        const order = await service.searchOrder(data);
        helper.deliverResponse(res, 200, order);
    } catch (error) {
        helper.deliverResponse(res, 422, {}, {
            error_code: messages.serverError.error_code,
            error_message: messages.serverError.error_message,
        });
    }
};

exports.searchPendingOrder = async (req, res) => {
    try {
        const { body } = req;
        let data = {};
        for (let _key of Object.keys(body)) {
            if (body[_key] != "") {
                data[_key] = body[_key];
            }
        }
        if (data["fdate"] && data["tdate"]) {
            data["orderDate"] = {
                $gte: new Date(new Date(data["fdate"]).toUTCString()),
                $lte: new Date(new Date(data["tdate"]).toUTCString()),
            };
            delete data["fdate"];
            delete data["tdate"];
        } else if (data["fdate"]) {
            data["orderDate"] = {
                $gte: new Date(new Date(data["fdate"]).toUTCString()),
            };
            delete data["fdate"];
        } else if (data["tdate"]) {
            data["orderDate"] = {
                $lte: new Date(new Date(data["tdate"]).toUTCString()),
            };
            delete data["tdate"];
        }
        data["isDelete"] = false;
        data["orderStatus"] = "PENDING";
        const order = await service.searchOrder(data);
        helper.deliverResponse(res, 200, order);
    } catch (error) {
        helper.deliverResponse(res, 422, {}, {
            error_code: messages.serverError.error_code,
            error_message: messages.serverError.error_message,
        });
    }
};

//Controller to update the product status in orders
exports.updateOrderStatus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      helper.deliverResponse(res, 422, errors, {
        error_code: messages.VALIDATION_ERROR.error_code,
        error_message: messages.VALIDATION_ERROR.error_message,
      });
      return;
    }
 
    const { body } = req;
    const settings = await settingsService.findOne({});
    let orderDetails = await service.getOrderDetails({ orderNo: body.order });
    const helpDetails = await helpService.findOne();
    const query = { orderNo: body.order, "products.productId": body.product };
    // const productDetails = await productService.getSingleProduct({ _id: body.product })

    for (let product of orderDetails?.products) {
      if (product.productId._id.toString() == body.product.toString()) {
        const isExists = product?.history?.some(
          (history) => history.some == body.status
        );
        if (isExists) {
          return helper.deliverResponse(
            res,
            422,
            {},
            {
              error_code: messages.ORDER_STATUS_ALREADY_EXISTS.error_code,
              error_message: messages.ORDER_STATUS_ALREADY_EXISTS.error_message,
            }
          );
        } else {
          if (body.status === "ACCEPTED") {
            try {
                    // Skip if product already has this status
                  
                        try {
                            // Create shipment
                            const shipmentResult = await PostShippingService.createShipment(
                                product,
                                orderDetails,
                                settings
                            );
                            await service.updateOne(
                              {
                                orderNo: body.order,
                                "products.productId": product.productId._id,
                              },
                              {
                                // "products.$.history": [
                                //   ...product.history,
                                //   { status: body.status, date: new Date() },
                                // ],
                                "products.$.shipmentNumber": shipmentResult.shipmentNumber,
                                "products.$.shipmentLogs": [ shipmentResult.log]
                              }
                            );
                        } catch (error) {
                            console.error('Shipping creation failed for product:', error);
                            // Store error log if available
                            if (error.log) {
                                await service.updateOne(
                                    {
                                        orderNo: body.order,
                                        "products.productId": product.productId._id,
                                    },
                                    {
                                        $push: {
                                            "products.$.shipmentLogs": error.log
                                        }
                                    }
                                );
                            }
                            // Continue with next product even if shipping fails
                        }
            } catch (error) {
                console.error('Error in shipping creation:', error);
                // Continue with order update even if shipping creation fails
            }
        }
          if (orderDetails.paymentMethod == "ONLINE") {
            await service.updateOne(
              { orderNo: body.order, "products.productId": body.product },
              {
                "products.$.history": [
                  ...product?.history,
                  { status: body.status, date: new Date() },
                ],
              }
            );
          } else {
            if (body.status == "DELIVERED") {
              await service.updateOne(
                { orderNo: body.order, "products.productId": body.product },
                {
                  "products.$.history": [
                    ...product?.history,
                    { status: body.status, date: new Date() },
                  ],
                  "products.$.paymentStatus":
                    body.status == "DELIVERED" ? "PAID" : product.paymentStatus,
                }
              );
            } else {
              await service.updateOne(
                { orderNo: body.order, "products.productId": body.product },
                {
                  "products.$.history": [
                    ...product?.history,
                    { status: body.status, date: new Date() },
                  ],
                }
              );
            }
          }
        }
      }
    }

    orderDetails = await service.getOrderDetails({ orderNo: body.order });
    const productHistories = orderDetails.products.map(
      (product) => product.history
    );
    const latestStatuses = productHistories.map((history) => {
      const lastStatus = history[history.length - 1].status;
      return lastStatus;
    });

    const areAllStatusesSame = latestStatuses.every(
      (status) => status === latestStatuses[0]
    );
    if (areAllStatusesSame) {
      let payload = { orderStatus: latestStatuses[0] };
      if (latestStatuses[0] == "CANCELLED") {
        payload["cancel"] = {
          reason: "Product cancelled from store",
          date: new Date(),
        };
      }
      const orderDetails = await service.updateOrder(body.order, payload);
      const customerDetails = await customerService.getCustomer({
        _id: orderDetails?.customerId,
      });
      const guestDetails = await guestService.findGuestById(
        orderDetails?.guestId
      );

      const templateData = {
        orderNo: orderDetails.orderNo,
        orderDate: new Intl.DateTimeFormat("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        }).format(new Date(orderDetails.createdAt)),
        customerName: customerDetails?.name || guestDetails?.firstname || "",
        storeName: settings.name,
        orderTotal: settings.currency + " " + orderDetails?.wholeTotal,
        supportEmail: helpDetails?.email,
        supportPhone: helpDetails?.phone,
        primaryColor: settings?.colors?.primary || "#000000",
        logoUrl: BASE_URL + settings.logo,
        downloadUrl:
          BASE_URL + "api/v1/w/invoice/" + orderDetails.orderNo.split("#")[1],
      };

      switch (latestStatuses[0]) {
        case "DELIVERED":
          //Update the payment status of all products to paid only if the payment method is COD
          if (
            orderDetails.paymentMethod == "COD" ||
            orderDetails.paymentMethod == "CARD"
          ) {
            for (let product of orderDetails?.products) {
              await service.updateOne(
                {
                  orderNo: body.order,
                  "products.productId": product.productId,
                },
                {
                  "products.$.paymentStatus": "PAID",
                  paymentStatus: "PAID",
                }
              );
            }
          }

          const deliveredSubject = `Your order ${orderDetails?.orderNo} has been delivered`;
          const deliveredContent = `Your order ${orderDetails?.orderNo} has been delivered`;
          const deliveredTemplate = await templates.orderDelivered(
            templateData
          );
          // await mailer.sendMail(
          //   customerDetails?.email || guestDetails?.email,
          //   deliveredSubject,
          //   deliveredContent,
          //   deliveredTemplate
          // );
          await notificationService.create({
            customers: [customerDetails?._id],
            title: "Order delivered",
            content: "Order " + orderDetails?.orderNo + " has been delivered",
            channel: "push",
            type: "instant",
            redirection:
              settings?.domain +
              "/order-detail/" +
              orderDetails?.orderNo.split("#")[1],
            status: "sent",
          });
          break;
        case "COLLECTED":
          const collectedSubject = `Your order ${orderDetails?.orderNo} has been delivered`;
          const collectedContent = `Your order ${orderDetails?.orderNo} has been delivered`;
          const collectedTemplate = await templates.orderDelivered(
            templateData
          );
          // await mailer.sendMail(
          //   customerDetails?.email || guestDetails?.email,
          //   collectedSubject,
          //   collectedContent,
          //   collectedTemplate
          // );
          await notificationService.create({
            customers: [customerDetails?._id],
            title: "Order delivered",
            content: "Order " + orderDetails?.orderNo + " has been delivered",
            channel: "push",
            type: "instant",
            redirection:
              settings?.domain +
              "/orders/" +
              orderDetails?.orderNo.split("#")[1],
            status: "sent",
          });
          break;
        case "ACCEPTED":
          const acceptedSubject = `Your order ${orderDetails?.orderNo} has been accepted`;
          const acceptedContent = `Your order ${orderDetails?.orderNo} has been accepted`;
          const acceptedTemplate = await templates.orderAccepted(templateData);
          // await mailer.sendMail(
          //   customerDetails?.email || guestDetails?.email,
          //   acceptedSubject,
          //   acceptedContent,
          //   acceptedTemplate
          // );

          if (customerDetails?.deviceTokens.length > 0) {
            let pushMessage = {
              tokens: customerDetails?.deviceTokens,
              notification: {
                title: "Order accepted",
                body: "Order " + orderDetails?.orderNo + " has been accepted",
              },
              webpush: {
                fcm_options: {
                  link: "/order-detail/" + orderDetails?.orderNo.split("#")[1],
                },
              },
            };

            admin
              .messaging()
              .sendEachForMulticast(pushMessage)
              .then(async (response) => {
                await notificationService.create({
                  customers: [customerDetails?._id],
                  title: "Order accepted",
                  content:
                    "Order " + orderDetails?.orderNo + " has been accepted",
                  channel: "push",
                  type: "instant",
                  redirection:
                    settings?.domain +
                    "/order-detail/" +
                    orderDetails?.orderNo.split("#")[1],
                  status: "sent",
                });
              })
              .catch((error) => {
                console.log(error);
              });
          }
          break;
        case "CANCELLED":
          const cancelledSubject = `Your order ${orderDetails?.orderNo} has been cancelled`;
          const cancelledContent = `Your order ${orderDetails?.orderNo} has been cancelled`;
          const cancelledTemplate = await templates.orderCancelled(
            templateData
          );
          await mailer.sendMail(
            customerDetails?.email || guestDetails?.email,
            cancelledSubject,
            cancelledContent,
            cancelledTemplate
          );

          if (customerDetails.deviceTokens.length > 0) {
            let pushMessage = {
              tokens: customerDetails?.deviceTokens,
              notification: {
                title: "Order Cancelled",
                body: "Order " + orderDetails?.orderNo + " has been cancelled",
              },
              webpush: {
                fcm_options: {
                  link: "/order-detail/" + orderDetails?.orderNo.split("#")[1],
                },
              },
            };

            admin
              .messaging()
              .sendEachForMulticast(pushMessage)
              .then(async (response) => {
                await notificationService.create({
                  customers: [customerDetails?._id],
                  title: "Order cancelled",
                  content:
                    "Order " + orderDetails?.orderNo + " has been cancelled",
                  channel: "push",
                  type: "instant",
                  redirection:
                    settings?.domain +
                    "/order-detail/" +
                    orderDetails?.orderNo.split("#")[1],
                  status: "sent",
                });
              })
              .catch((error) => {
                console.log(error);
              });
          }
          break;
        case "OUT FOR DELIVERY":
          if (customerDetails.deviceTokens.length > 0) {
            let pushMessage = {
              tokens: customerDetails?.deviceTokens,
              notification: {
                title: orderDetails?.orderNo + " Out for delivery🤩",
                body: "Your order is out for delivery and will be delivered to you by today.",
              },
              webpush: {
                fcm_options: {
                  link: "/order-detail/" + orderDetails?.orderNo.split("#")[1],
                },
              },
            };

            admin
              .messaging()
              .sendEachForMulticast(pushMessage)
              .then(async (response) => {
                await notificationService.create({
                  customers: [customerDetails?._id],
                  title: orderDetails?.orderNo + " Out for delivery🤩",
                  content:
                    "Your order is out for delivery and will be delivered to you by today.",
                  channel: "push",
                  type: "instant",
                  redirection:
                    settings?.domain +
                    "/order-detail/" +
                    orderDetails?.orderNo.split("#")[1],
                  status: "sent",
                });
              })
              .catch((error) => {
                console.log(error);
              });
          }
          break;
      }
    } else {
      await service.updateOrder(body.order, {
        orderStatus: "PARTIAL PROCESSED",
      });
    }

        helper.deliverResponse(res, 200, {}, {
            error_code: messages.ORDER_STATUS_UPDATED.error_code,
            error_message: messages.ORDER_STATUS_UPDATED.error_message,
        });
    } catch (error) {
        console.log('Error caught in update order status API :: ' + error)
        helper.deliverResponse(res, 422, error, {
            error_code: messages.serverError.error_code,
            error_message: messages.serverError.error_message,
        });
    }
}

exports.updateOrderPayment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      helper.deliverResponse(res, 422, errors, {
        error_code: messages.VALIDATION_ERROR.error_code,
        error_message: messages.VALIDATION_ERROR.error_message,
      });
      return;
    }

        const { body } = req
        const query = { orderNo: body.order, 'products.productId': body.product }
        let action = { 'products.$.paymentStatus': body.status }
        const orderResponse = await service.update(query, { $set: action })
        if (orderResponse instanceof Error) {
            helper.deliverResponse(res, 200, {}, {
                error_code: messages.serverError.error_code,
                error_message: messages.serverError.error_message,
            });
        } else {
            const orderDetails = await service.getOrderDetails({ orderNo: body.order })
            const paymentHistory = orderDetails.products.map(product => product.paymentStatus);
            const paymentStatus = paymentHistory.every((element, index, array) => element === array[0]);
            if (paymentStatus) {
                await service.update({ orderNo: body.order }, { $set: { paymentStatus: paymentHistory[0] } })
            } else {
                await service.update({ orderNo: body.order }, { $set: { paymentStatus: 'PARTIALLY PAID' } })
            }

            helper.deliverResponse(res, 200, orderResponse, {
                error_code: messages.PAYMENT_STATUS.error_code,
                error_message: messages.PAYMENT_STATUS.error_message,
            });
        }
    } catch (error) {
        console.log('Error caught in update order payment API :: ' + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.updateOrderProducts = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      helper.deliverResponse(res, 422, errors, {
        error_code: messages.VALIDATION_ERROR.error_code,
        error_message: messages.VALIDATION_ERROR.error_message,
      });
      return;
    }

        const { body } = req
        const query = { orderNo: body.order, 'products.productId': body.product }
        let action = {}
        if (body?.dateExpected) action['products.$.dateExpected'] = body?.dateExpected
        if (body?.deliveryPerson) action['products.$.deliveryPerson'] = body?.deliveryPerson
        if (body?.trackingURL) action['products.$.trackingURL'] = body?.trackingURL
        if (body?.trackingNo) action['products.$.trackingNo'] = body?.trackingNo
        const orderDetails = await service.update(query, { $set: action })
        if (orderDetails instanceof Error) {
            helper.deliverResponse(res, 200, {}, {
                error_code: messages.serverError.error_code,
                error_message: messages.serverError.error_message,
            });
        } else {
            helper.deliverResponse(res, 200, orderDetails, {
                error_code: messages.ORDER_UPDATED.error_code,
                error_message: messages.ORDER_UPDATED.error_message,
            });
        }
    } catch (error) {
        console.log('Error caught in update order dates API :: ' + error)
        helper.deliverResponse(res, 422, {}, {
            error_code: messages.serverError.error_code,
            error_message: messages.serverError.error_message,
        });
    }
}

exports.getOrderStatusList = async (req, res) => {
  try {
    const { status, delivery } = req.query;
    const statusList = ["FAILED"];
    const deliveryStatusList = [
      "PENDING",
      "PLACED",
      "ACCEPTED",
      "PACKED",
      "SHIPPED",
      "OUT FOR DELIVERY",
      "DELIVERED",
      "CANCELLED",
    ];
    const collectStatusList = [
      "PENDING",
      "PLACED",
      "ACCEPTED",
      "PACKED",
      "COLLECTED",
    ];
    const orderStatusList = [];
    delivery == "collect"
      ? orderStatusList.push(...collectStatusList)
      : orderStatusList.push(...deliveryStatusList);
    let newStatusArray = [];
    const statusIndex = orderStatusList.indexOf(status.toUpperCase());

    if (statusIndex != -1) {
      let newArray = orderStatusList.slice(statusIndex + 1);
      newArray = [...newArray, ...statusList];
      for (let item of newArray) {
        const capitalizedKey =
          item.charAt(0).toUpperCase() + item.slice(1).toLowerCase();
        newStatusArray.push({ key: capitalizedKey, value: item });
      }
    } else {
      let newArray = [...orderStatusList, ...statusList];
      for (let item of newArray) {
        const capitalizedKey =
          item.charAt(0).toUpperCase() + item.slice(1).toLowerCase();
        newStatusArray.push({ key: capitalizedKey, value: item });
      }
    }

        helper.deliverResponse(res, 200, newStatusArray, {
            error_code: messages.successResponse.error_code,
            error_message: messages.successResponse.error_message,
        });
    } catch (error) {
        console.log('Error caught in get order status list API :: ' + error)
        helper.deliverResponse(res, 422, {}, {
            error_code: messages.serverError.error_code,
            error_message: messages.serverError.error_message,
        });
    }
}
//order  report old
// exports.orderReport = async(req, res) => {
//     try {
//         const orderDetails = await service.getOrders({ isDelete: false }, { __v: 0, _id: 0 })
//         let orders = []
//         let headers = [
//             { id: 'orderNo', title: 'Order No' },
//             { id: 'orderDate', title: 'Order Date' },
//             { id: 'orderTime', title: 'Order Time' },
//             { id: 'name', title: 'Name' },
//             { id: 'email', title: 'Email' },
//             { id: 'countryCode', title: 'Country Code' },
//             { id: 'mobile', title: 'Mobile' },
//             { id: 'products', title: 'Products' },
//             { id: 'subtotal', title: 'Sub Total' },
//             { id: 'discountTotal', title: 'Discount Total' },
//             { id: 'taxTotal', title: 'Tax Total' },
//             { id: 'additionalCharge', title: 'Additional Charge' },
//             { id: 'codCost', title: 'COD Charge' },
//             { id: 'shippingCost', title: 'Shiiping Charge' },
//             { id: 'total', title: 'Total' }
//         ]
//         const csvWriter = createCsvWriter({ path: 'order_report.csv', header: headers });
//         for (let order of orderDetails) {
//             orders.push({
//                 orderNo: order ?.orderNo,
//                 name: order ?.customerId ?.name,
//                 email: order ?.customerId ?.email,
//                 countryCode: order ?.customerId ?.countryCode,
//                 mobile: order ?.customerId ?.mobile,
//                 subtotal: order ?.subtotal,
//                 discountTotal: order ?.discount,
//                 additionalCharge: order ?.additionalCharge,
//                 taxTotal: order ?.tax,
//                 products: order.products.map(item => {
//                     return item ?.productId ?.name
//                 }).join(', '),
//                 shippingCost: order ?.shippingCost,
//                 codCost: order ?.codCost,
//                 total: order ?.total,
//                 orderDate: new Date(order ?.createdAt).toLocaleString(),
//                 orderTime: new Date(order ?.createdAt).toLocaleTimeString(),
//             })
//         }
//         csvWriter.writeRecords(orders)
//             .then(() => {
//                 res.setHeader('Content-disposition', 'attachment; filename=order_report.csv');
//                 res.setHeader('Content-type', 'text/csv');
//                 res.status(200).download(process.cwd() + '/order_report.csv', () => {
//                     fs.unlink(process.cwd() + '/order_report.csv', (err) => {})
//                 });
//             })
//             .catch((err) => {
//                 res.status(500).send("Internal Server Error");
//             });
//     } catch (error) {
//         console.log('Error caught while order report API :: ' + error)
//         helper.deliverResponse(res, 422, {}, {
//             "error_code": messages.serverError.error_code,
//             "error_message": messages.serverError.error_message
//         });
//     }
// }
//new order report
// exports.orderReport = async (req, res) => {
//   try {
//     const orderDetails = await service.getOrders(
//       { isDelete: false },
//       { __v: 0, _id: 0 }
//     );
//     let orders = [];
//     let headers = [
//       { id: "orderNo", title: "Order No" },
//       { id: "orderDate", title: "Order Date" },
//       { id: "orderTime", title: "Order Time" },
//       { id: "name", title: "Name" },
//       { id: "email", title: "Email" },
//       { id: "countryCode", title: "Country Code" },
//       { id: "mobile", title: "Mobile" },
//       { id: "products", title: "Products" },
//       { id: "subtotal", title: "Sub Total" },
//       { id: "discountTotal", title: "Discount Total" },
//       { id: "taxTotal", title: "Tax Total" },
//       { id: "additionalCharge", title: "Additional Charge" },
//       { id: "codCost", title: "COD Charge" },
//       { id: "shippingCost", title: "Shipping Charge" },
//       { id: "total", title: "Total" },
//     ];

//     const csvFilePath = `${Date.now()}_order_report.csv`;
//     const csvWriter = createCsvWriter({ path: csvFilePath, header: headers });

//     for (let order of orderDetails) {
//       orders.push({
//         orderNo: order?.orderNo,
//         name: order?.customerId?.name,
//         email: order?.customerId?.email,
//         countryCode: order?.customerId?.countryCode,
//         mobile: order?.customerId?.mobile,
//         subtotal: order?.subtotal,
//         discountTotal: order?.discount,
//         additionalCharge: order?.additionalCharge,
//         taxTotal: order?.tax,
//         products: order.products
//           .map((item) => item?.productId?.name)
//           .join(", "),
//         shippingCost: order?.shippingCost,
//         codCost: order?.codCost,
//         total: order?.total,
//         orderDate: new Date(order?.createdAt).toLocaleDateString(),
//         orderTime: new Date(order?.createdAt).toLocaleTimeString(),
//       });
//     }

//     await csvWriter.writeRecords(orders);

//     const fileStream = fs.createReadStream(csvFilePath);
//     const uploadParams = {
//       Bucket: process.env.AWS_S3BUCKET_NAME,
//       Key: `reports/${csvFilePath}`,
//       Body: fileStream,
//       ContentType: "text/csv",
//     };

//     const data = await s3.upload(uploadParams).promise();
//     const fileUrl = data.Location;

//     const subject = "Order Report CSV Export Download Link";
//     const content = `<a href="${fileUrl}" target="_blank">Download</a>`;
//     console.log("fileUrl",fileUrl);

//     try {
//       await mailer.sendMail(res.locals.user.email, subject, "", content);
//     } catch (error) {
//       console.log("Error caught while sending email: " + error);
//     }

//     // Clean up by deleting the local file after uploading
//     fs.unlink(csvFilePath, (err) => {
//       if (err) console.error("Error deleting local file:", err);
//     });

//         return helper.deliverResponse(res, 200, {
//             orders,
//             error_code: messages.successResponse.error_code,
//             error_message: messages.successResponse.error_message,
//         });

//     } catch (error) {
//         console.log('Error caught while processing order report API:', error);
//         return helper.deliverResponse(res, 422, {}, {
//             "error_code": messages.serverError.error_code,
//             "error_message": messages.serverError.error_message
//         });
//     }
// };
// exports.orderReport = async (req, res) => {
//   try {
//     const orderDetails = await service.getOrders({ isDelete: false }, { __v: 0 });
    
//     if (!orderDetails || orderDetails.length === 0) {
//       return helper.deliverResponse(res, 404, {}, { "error_code": "NO_ORDERS", "error_message": "No orders found." });
//     }
  

//     let orders = [];
//     const headers = [
//       { id: "orderNo", title: "Order No" },
//       { id: "orderDate", title: "Order Date" },
//       { id: "orderTime", title: "Order Time" },
//       { id: "name", title: "Name" },
//       { id: "email", title: "Email" },
//       { id: "countryCode", title: "Country Code" },
//       { id: "mobile", title: "Mobile" },
//       { id: "products", title: "Products" },
//       { id: "subtotal", title: "Sub Total" },
//       { id: "discountTotal", title: "Discount Total" },
//       { id: "taxTotal", title: "Tax Total" },
//       { id: "additionalCharge", title: "Additional Charge" },
//       { id: "codCost", title: "COD Charge" },
//       { id: "shippingCost", title: "Shipping Charge" },
//       { id: "total", title: "Total" },
//       { id: "fulfillmentStatus", title: "Fulfillment Status" },
//       { id: "fulfillmentDate", title: "Fulfillment Date" },
//       { id: "shippingDate", title: "Shipping Date" },
//       { id: "carrierName", title: "Shipping Carrier" },
//       { id: "trackingNumber", title: "Tracking Number" },
//       { id: "estimatedDeliveryDate", title: "Est. Delivery Date" },
//       { id: "actualDeliveryDate", title: "Actual Delivery Date" },
//       { id: "deliveryTimeframe", title: "Delivery Timeframe (Days)" }
//     ];
    
//     const formatDate = (date) => date ? new Date(date).toLocaleDateString() : '';
   
//     for (let order of orderDetails) {
        
//       let deliveryTimeframe = null;
//       let fulfillmentStatus = order?.orderStatus;
//       let shippingDate = '';
//       let actualDeliveryDate = '';

      
//       if (order?.orderStatus === 'DELIVERED') {
//         const createdAt = new Date(order.createdAt).getTime();
//         const updatedAt = new Date(order.updatedAt).getTime();
//         order.fulfillmentDate= new Date(order.updatedAt).getTime();
//         deliveryTimeframe = Math.ceil((updatedAt - createdAt) / (1000 * 60 * 60 * 24));
//       }
      
//       orders.push({
//         orderNo: order.orderNo || '',
//         name: order?.customerId?.name || '',
//         email: order?.customerId?.email || '',
//         countryCode: order?.customerId?.countryCode || '',
//         mobile: order?.customerId?.mobile || '',
//         subtotal: order.subtotal || 0,
//         discountTotal: order.discount || 0,
//         additionalCharge: order.additionalCharge || 0,
//         taxTotal: order.tax || 0,
//         products: order?.products?.map(p => p?.productId?.name || '').filter(Boolean).join(", ") || 'N/A',
//         shippingCost: order.shippingCost || 0,
//         codCost: order.codCost || 0,
//         total: order.total || 0,
//         orderDate: formatDate(order.createdAt),
//         orderTime: new Date(order.createdAt).toLocaleTimeString(),
//         fulfillmentStatus,
//           shippingDate,
//        estimatedDeliveryDate: formatDate(order?.shippingDetails?.estimatedDeliveryDate),
//         actualDeliveryDate,
      
//       });
//     }

//     const csvFilePath = `${Date.now()}_order_report.csv`;
//     const csvWriter = createCsvWriter({ path: csvFilePath, header: headers });
//     await csvWriter.writeRecords(orders);
    
//     const fileStream = fs.createReadStream(csvFilePath);
//     const uploadParams = {
//       Bucket: process.env.AWS_S3BUCKET_NAME,
//       Key: `reports/${csvFilePath}`,
//       Body: fileStream,
//       ContentType: "text/csv",
//     };
    
//     const uploadResult = await s3.upload(uploadParams).promise();
//     const fileUrl = uploadResult.Location;
    
//     const subject = "Order Report CSV Export Download Link";
//     const content = `<p>Find your order report with fulfillment and delivery details below:</p>
//                     <p><a href="${fileUrl}" target="_blank">Download Report</a></p>`;
    
//     try {
//       await mailer.sendMail(res.locals.user.email, subject, "", content);
//     } catch (error) {
//       console.error("Error sending email:", error);
//     }
    
//     fs.unlink(csvFilePath, (err) => {
//       if (err) console.error("Error deleting local file:", err);
//     });
    
//     return helper.deliverResponse(res, 200, { orders, error_code: messages.successResponse.error_code, error_message: messages.successResponse.error_message });
//   } catch (error) {
//     console.error('Error processing order report:', error);
//     return helper.deliverResponse(res, 422, {}, { error_code: messages.serverError.error_code, error_message: messages.serverError.error_message });
//   }
// };
exports.orderReport = async (req, res) => {
  try {
    const orderDetails = await service.getOrders({ isDelete: false }, { __v: 0 });

    if (!orderDetails || orderDetails.length === 0) {
      return helper.deliverResponse(res, 404, {}, { error_code: "NO_ORDERS", error_message: "No orders found." });
    }

    let orders = [];
    const headers = [
      { id: "orderNo", title: "Order No" },
      { id: "orderDate", title: "Order Date" },
      { id: "orderTime", title: "Order Time" },
      { id: "name", title: "Name" },
      { id: "email", title: "Email" },
      { id: "countryCode", title: "Country Code" },
      { id: "mobile", title: "Mobile" },
      { id: "products", title: "Products" },
      { id: "subtotal", title: "Sub Total" },
      { id: "discountTotal", title: "Discount Total" },
      { id: "taxTotal", title: "Tax Total" },
      { id: "additionalCharge", title: "Additional Charge" },
      { id: "codCost", title: "COD Charge" },
      { id: "shippingCost", title: "Shipping Charge" },
      { id: "total", title: "Total" },
      { id: "fulfillmentStatus", title: "Fulfillment Status" },
      { id: "shippingDate", title: "Shipping Date" },
      
      { id: "fulfillmentDate", title: "Fulfillment Date" },     
      { id: "actualDeliveryDate", title: "Actual Delivery Date" },
      { id: "deliveryTimeframe", title: "Delivery Timeframe (Days)" },
    ];

    const formatDate = (date) => (date ? new Date(date).toLocaleDateString() : "");

    for (let order of orderDetails) {
      let deliveryTimeframe = null;
      let fulfillmentStatus = order?.orderStatus || "";
      let shippingDate = "";
      let actualDeliveryDate = "";
      let fulfillmentDate = "";

  const oldestShipmentDate = order?.products?.reduce((oldest, product) => {
    const productOldest = product.shipmentLogs.reduce((oldestLog, log) => {
      return oldestLog ? new Date(oldestLog.createdAt) < new Date(log.createdAt) ? log : oldestLog : log;
    }, null);
    return oldest ? new Date(oldest.createdAt) < new Date(productOldest?.createdAt) ? productOldest : oldest : productOldest;
  }, null);
  // console.log(oldestShipmentDate ? new Date(oldestShipmentDate.createdAt).toLocaleDateString() : "");

      if (order?.orderStatus === "SHIPPED") {
        shippingDate = formatDate(order?.shippingDetails?.shippedDate);
      }

      if (order?.orderStatus === "DELIVERED") {
        actualDeliveryDate = formatDate(order?.shippingDetails?.deliveredDate);
        fulfillmentDate = formatDate(order.updatedAt);
        const createdAtDate = new Date(order.createdAt);
        const updatedAtDate = new Date(order.updatedAt);
        deliveryTimeframe = Math.ceil((updatedAtDate - createdAtDate) / (1000 * 60 * 60 * 24));
      }

      orders.push({
        orderNo: order.orderNo || "",
        name: order?.customerId?.name || "",
        email: order?.customerId?.email || "",
        countryCode: order?.customerId?.countryCode || "",
        mobile: order?.customerId?.mobile || "",
        subtotal: order.subtotal || 0,
        discountTotal: order.discount || 0,
        additionalCharge: order.additionalCharge || 0,
        taxTotal: order.tax || 0,
        products: order?.products?.map((p) => p?.productId?.name || "").filter(Boolean).join(", ") || "N/A",
        shippingCost: order.shippingCost || 0,
        codCost: order.codCost || 0,
        total: order.total || 0,
        orderDate: formatDate(order.createdAt),
        orderTime: new Date(order.createdAt).toLocaleTimeString(),
        fulfillmentStatus,
        fulfillmentDate:fulfillmentDate,
        shippingDate:oldestShipmentDate ? new Date(oldestShipmentDate.createdAt).toLocaleDateString() : "",
        estimatedDeliveryDate: formatDate(order?.shippingDetails?.estimatedDeliveryDate),
        actualDeliveryDate,
        deliveryTimeframe,
      });
    }

    const csvFilePath = `${Date.now()}_order_report.csv`;
    const csvWriter = createCsvWriter({ path: csvFilePath, header: headers });
    await csvWriter.writeRecords(orders);

    const fileStream = fs.createReadStream(csvFilePath);
    const uploadParams = {
      Bucket: process.env.AWS_S3BUCKET_NAME,
      Key: `reports/${csvFilePath}`,
      Body: fileStream,
      ContentType: "text/csv",
    };

    const uploadResult = await s3.upload(uploadParams).promise();
    const fileUrl = uploadResult.Location;

    const subject = "Order Report CSV Export Download Link";
    const content = `<p>Find your order report with fulfillment and delivery details below:</p>
                    <p><a href="${fileUrl}" target="_blank">Download Report</a></p>`;

    try {
      await mailer.sendMail(res.locals.user.email, subject, "", content);
    } catch (error) {
      console.error("Error sending email:", error);
    }

    fs.unlink(csvFilePath, (err) => {
      if (err) console.error("Error deleting local file:", err);
    });

    return helper.deliverResponse(res, 200, { orders, error_code: "SUCCESS", error_message: "Report generated successfully" });
  } catch (error) {
    console.error("Error processing order report:", error);
    return helper.deliverResponse(res, 422, {}, { error_code: "SERVER_ERROR", error_message: "Failed to process report" });
  }
};

exports.orderCounts = async (req, res) => {
    try {
        const { body } = req
        let results = []
        for (let _item of body?.status) {
            let query = { isDelete: false, isActive: true }
            if (_item?.value != '') query['orderStatus'] = _item?.value
            const totalOrders = await service.getOrderCounts(query)
            results.push({
                status: _item?.status,
                value: _item?.value,
                count: totalOrders
            })
        }
        helper.deliverResponse(res, 200, results, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        });
    } catch (error) {
        console.log('Error caught in order counts API :: ' + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.updateProductQuantity = async (req, res) => {
  try {
    const { body } = req;
    const orderDetails = await service.getOrderDetails({
      orderNo: body?.order,
    });
    const productDetails = await productService.getProductDetails({
      slug: body?.product,
    });

    let total = 0;
    let tax = 0;
    let discount = 0;
    let subtotal = 0;

        for (let product of orderDetails?.products) {
            if (String(product?.productId?._id) == String(productDetails?._id)) {

            } else {

            }
        }
    } catch (error) {
        console.log('Error caught in update product quantity API :: ' + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.addProduct = async (req, res) => {
  try {
    const { body } = req;
    const orderDetails = await service.getOrderDetails({
      orderNo: body?.order,
    });
    const productDetails = await productService.getSingleProduct({
      slug: body?.product,
    });
    const taxPercentage = productDetails?.product?.id?.tax?.rate / 100;
    const taxAmount = productDetails?.price?.selling * taxPercentage;
    const baseTotal = productDetails?.price?.selling - taxAmount;
    let productPayload = {
      productId: productDetails?._id,
      quantity: "1",
      history: [{ status: "PLACED", date: new Date().toUTCString() }],
      taxTotal: taxAmount.toFixed(2),
      pricePerUnit: productDetails?.price?.selling.toFixed(2),
      baseTotal: baseTotal.toFixed(2),
      total: productDetails?.price?.selling.toFixed(2),
    };

        let orderPayload = {
            total: (Number(orderDetails?.total) + productDetails?.price?.selling).toFixed(2),
            subtotal: (Number(orderDetails?.priceBeforeTax) + baseTotal).toFixed(2),
            priceBeforeTax: (Number(orderDetails?.priceBeforeTax) + baseTotal).toFixed(2),
            priceAfterTax: (Number(orderDetails?.priceAfterTax) + productDetails?.price?.selling).toFixed(2),
            tax: (Number(orderDetails?.tax) + taxAmount).toFixed(2),
        }
    } catch (error) {
        console.log('Error caught in add product API :: ' + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.manageOrderTags = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      helper.deliverResponse(res, 422, errors, {
        error_code: messages.VALIDATION_ERROR.error_code,
        error_message: messages.VALIDATION_ERROR.error_message,
      });
      return;
    }

    const { body } = req;
    const { type } = req.query;
    const orderDetails = await service.getOrderDetails({ orderNo: body.order });
    let tags = orderDetails?.tags ? [...orderDetails?.tags] : [];
    switch (type) {
      case "add":
        tags.push(body.tag.toLowerCase());
        break;
      case "delete":
        tags.splice(body.tag, 1);
        break;
    }

        const updatedOrder = await service.update({ orderNo: body.order }, { $set: { tags: tags } })
        if (updatedOrder instanceof Error) {
            helper.deliverResponse(res, 422, {}, {
                "error_code": messages.serverError.error_code,
                "error_message": messages.serverError.error_message
            });
        } else {
            activity.logActivity(res?.locals?.user?.email, `Order tag updated for ${body.order}`)
            helper.deliverResponse(res, 200, {}, {
                "error_code": messages.ORDER_TAG_UPDATED.error_code,
                "error_message": messages.ORDER_TAG_UPDATED.error_message
            });
        }
    } catch (_error) {
        console.log('Error caught in manage order tags API :: ' + _error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.invoiceDetails = async (req, res) => {
    try {
        const { order } = req.params
        const { email } = res?.locals?.user
        const orderDetails = await service.getOrderDetails({ orderNo: '#' + order })
        // const guestDetails = await guestService.findGuestById(
        //     orderDetails?.guestId
        // );
        console.log("guestDetails",orderDetails)
        let tags = orderDetails?.tags ? orderDetails?.tags : []
        tags.includes('printed') ? null : tags.push('printed')
        const updatedOrder = await service.update({ orderNo: '#' + order }, { $set: { tags: tags } })
        if (updatedOrder instanceof Error) {
            helper.deliverResponse(res, 422, {}, {
                "error_code": messages.serverError.error_code,
                "error_message": messages.serverError.error_message
            });
        } else {
            activity.logActivity(email, `Invoice generated for ${'#' + order}`)
            helper.deliverResponse(res, 200, {}, {
                "error_code": messages.successResponse.error_code,
                "error_message": messages.successResponse.error_message
            });
        }
    } catch (_error) {
        console.log('Error caught in invoice details API :: ' + _error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.exportOrderTabs = async (req, res) => {
  try {
    const { body } = req;
    const settings = await settingsService.findOne({});
    let data = { isDelete: false };
    if (body?.status) data.orderStatus = body?.status;
    if (body?.paymentMethod) data.paymentMethod = body?.paymentMethod;
    if (body?.source) data.source = body?.source;
    if (body?.paymentStatus) data.paymentStatus = body?.paymentStatus;
    if (body?.from)
      data.orderDate = {
        $gte: new Date(new Date(body?.from).setHours(0, 0, 0, 0)),
      };
    if (body?.to)
      data.orderDate = {
        $lte: new Date(new Date(body?.to).setHours(23, 59, 59, 999)),
      };
    if (body?.from && body?.to)
      data.orderDate = {
        $gte: new Date(new Date(body?.from).setHours(0, 0, 0, 0)),
        $lte: new Date(new Date(body?.to).setHours(23, 59, 59, 999)),
      };
    let customers = [];
    const users = await customerService.getClient({
      name: { $regex: body?.keyword, $options: "i" },
    });
    for (let user of users) customers.push(user?._id);
    if (body?.keyword)
      data["$or"] = [
        { orderNo: { $regex: body?.keyword, $options: "i" } },
        { customerId: { $in: customers } },
      ];
    const orders = await service.getOrders(data, {}, { createdAt: -1 });
    let items = [];
    if (orders.length > 0) {
      for (let order of orders) {
        items.push({
          order: order?.orderNo,
          paymentMethod:
            order?.paymentMethod == "COD" ? "Cash on delivery" : "Online",
          paymentStatus:
            order?.paymentStatus == "PENDING"
              ? "Pending"
              : order?.paymentStatus == "FAILED"
              ? "Failed"
              : "Completed",
          name: order?.customerId?.name,
          email: order?.customerId?.email,
          mobile:
            order?.customerId?.countryCode + " " + order?.customerId?.mobile,
          source:
            order?.source == "WEB"
              ? "Web"
              : order?.source == "ADMIN"
              ? "Admin"
              : "App",
          date: `${months[new Date(order?.orderDate).getMonth()]} ${new Date(
            order?.orderDate
          ).getDate()} ${new Date(order?.orderDate).getFullYear()} ${new Date(
            order?.orderDate
          ).toLocaleTimeString()}`,
          total: order?.total,
          subtotal: order?.priceBeforeTax,
          discount: order?.discount,
          tax: order?.tax,
          status:
            order?.orderStatus.charAt(0).toUpperCase() +
            order?.orderStatus.slice(1).toLowerCase(),
          additionalCharge: order?.additionalCharge,
          cod: order?.codCost,
          shipping: order?.shippingCost,
        });
      }

      const csvWriter = createCsvWriter({
        path: "ordertabs.csv",
        header: [
          { id: "order", title: "Order" },
          { id: "paymentMethod", title: "Payment Method" },
          { id: "paymentStatus", title: "Payment Status" },
          { id: "name", title: "Name" },
          { id: "email", title: "Email" },
          { id: "mobile", title: "Mobile" },
          { id: "source", title: "Source" },
          { id: "date", title: "Date" },
          { id: "total", title: "Total" },
          { id: "subtotal", title: "Subtotal" },
          { id: "discount", title: "Discount" },
          { id: "tax", title: "Tax" },
          { id: "status", title: "Status" },
          { id: "additionalCharge", title: "Additional Charge" },
          { id: "cod", title: "COD" },
          { id: "shipping", title: "Shipping" },
        ],
      });

            csvWriter.writeRecords(items).then(async () => {
                const subject = 'Order tabs CSV export download link'
                const content = templates.adminExportDownload({ logo: BASE_URL + settings?.logo?.path, link: process.env.API_URL + 'api/v1/w/admin/auth/download-order-tabs' })
                const mailResponse = await mailer.sendMail(res?.locals?.user?.email, subject, '', content)
                if (mailResponse instanceof Error) {
                    helper.deliverResponse(res, 500, {}, {
                        "error_code": messages.MAIL_NOT_SENT.error_code,
                        "error_message": messages.MAIL_NOT_SENT.error_message
                    });
                } else {
                    helper.deliverResponse(res, 200, {}, {
                        "error_code": 0,
                        "error_message": "CSV download link will be shared to your email address with few minutes"
                    });
                }
            }).catch((error) => {
                console.error("Error caught in export order tabs :: " + error);
                helper.deliverResponse(res, 500, {}, {
                    "error_code": messages.INTERNAL_serverError.error_code,
                    "error_message": messages.INTERNAL_serverError.error_message
                });
            });
        } else {
            helper.deliverResponse(res, 422, {}, {
                "error_code": 1,
                "error_message": "No orders found to export. Update your filters and try again."
            });
        }
    } catch (_error) {
        console.log('Error caught in export order tab API :: ' + _error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.downloadOrderTabs = async (req, res) => {
    try {
        const file = process.cwd() + '/ordertabs.csv'
        fs.access(file, fs.constants.F_OK, (error) => {
            if (error) {
                res.status(404).sendFile(process.cwd() + '/html/file-not-found/index.html')
            } else {
                res.download(file, 'ordertabs.csv', (err) => {
                    if (err) {
                        res.status(404).send('Internal server error')
                    } else {
                        fs.unlinkSync('ordertabs.csv');
                    }
                })
            }
        })
    } catch (_error) {
        console.log('Error caught in export order tab API :: ' + _error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

function getDatesBetween(start, end) {
  const dates = [];
  let currentDate = new Date(start);
  while (currentDate <= new Date(end)) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
}

//Sale report
exports.salesReport = async (req, res) => {
  try {
    const { dateRange, orderStatus } = req.query;
    let date;
    let today = new Date();
    let dates = []; // Initialize dates array at the top level
    
    console.log(req.query, "req.query items here");
    
    if (req.query.startDate && req.query.endDate) {
      // Calculate dates between custom date range
      dates = getDatesBetween(new Date(req.query.startDate), new Date(req.query.endDate)); // Remove 'let' to use the outer variable
      console.log(dates, "dates");
    } else {
      // Calculate dates based on predefined dateRange
      switch (dateRange) {
        case "5":
          date = new Date();
          date.setDate(today.getDate() - 5);
          break;
        case "15":
          date = new Date();
          date.setDate(today.getDate() - 15);
          break;
        case "1":
          date = new Date();
          date.setMonth(today.getMonth() - 1);
          break;
        case "3":
          date = new Date();
          date.setMonth(today.getMonth() - 3);
          break;
        case "6":
          date = new Date();
          date.setMonth(today.getMonth() - 6);
          break;
        case "12":
          date = new Date();
          date.setFullYear(today.getFullYear() - 1);
          break;
        case "custom":
          date = new Date(req.query.startDate);
          today = new Date(req.query.endDate);
          break;
      }
    
      console.log(date, "date");
      console.log(today, "today");
    
      dates = getDatesBetween(date, today);
    }
    
    console.log(dates, "dates");
    let dateItems = dates.map(
      (dateItem) => dateItem.toISOString().split("T")[0]
    );
    
    console.log(dateItems, "dateItems");
    let orderItems = [];
    let formattedOrders = [];
    const settings = await settingsService.findOne({});
    const csvFilePath = `${Date.now()}salereport.csv`;
    for (let dateItem of dateItems) {
      const queryDate = new Date(dateItem);
      const endDate = new Date(queryDate.setHours(23, 59, 59, 59));
      const startDate = new Date(queryDate.setHours(0, 0, 0, 0));

      let query = {
        createdAt: { $gte: startDate, $lte: endDate },
      };

      if (orderStatus) {
        query.orderStatus = { $eq: orderStatus };
      }

      const orders = await db.Order.find(query)
        .populate({
          path: "customerId",
          select: "name email mobile", // Choose fields you want from the customer schema
        })
        .populate({
          path: "coupon",
          select: "code value", // Choose fields you want from the coupon schema
        })
        .exec();
        const transformedOrders = orders.map((order) => ({
          date: order.createdAt,
          orderStatus: order.orderStatus,
          orderId: order.orderNo,
          invoiceNo: order.invoiceNo,
          customerType: order.customerType,
          customerName: order.customerId ? order.customerId.name : "Guest",
          // Address details
          firstname: order.address?.firstname,
          lastname: order.address?.lastname,
          email: order.address?.email, // This might be stored elsewhere in your actual data
          mobile: order.address?.mobile,
          countryCode: order.address?.countryCode,
          companyName: order.address?.companyName,
          addressType: order.address?.type,
          streetAddress: order.address?.streetAddress,
          aptSuiteUnit: order.address?.aptSuiteUnit,
          country: order.address?.country,
          city: order.address?.city,
          state: order.address?.state,
          postalCode: order.address?.postalCode,
          deliveryInstruction: order.address?.deliveryInstruction,
          
          // Order details
          source: order.source,
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus,
          orderType: order.orderType,
          
          // Applied coupon
          couponCode: order.coupon ? order.coupon.code : "No coupon applied",
          
          // Financial details
          currency: order.payment?.activities?.[0]?.currency || "AED",
          additionalCharge: order.additionalCharge,
          shippingCharge: order.shippingCharge,
          subtotal: order.subtotal,
          discount: order.discount,
          couponDiscount: order.couponDiscount,
          tax: order.tax,
          total: order.total,
          wholeTotal: order.wholeTotal,
          priceBeforeTax: order.priceBeforeTax,
          priceAfterTax: order.priceAfterTax,
          giftWrapTotal: order.giftWrapTotal,
          
          // Shipping info
          shippingNotes: order.shippingnotes,
          
          // Payment gateway details
          tamaraOrderId: order.payment?.tamara_order_id,
          tamaraCheckoutId: order.payment?.tamara_checkout_id,
          paymentReference: order.payment?.reference?.payment,
          paymentGateway: order.payment?.reference?.gateway,
          paymentStatus: order.payment?.status,
          
          // Product information
          productCount: order.products?.length || 0,
          
          // Tags and other metadata
          tags: order.tags ? order.tags.join(', ') : '',
          
          // Cancel information if applicable
          cancelReason: order.cancel?.reason,
          cancelDate: order.cancel?.date,
          
          // System flags
          isActive: order.isActive,
          isDeleted: order.isDelete
      }));

        formattedOrders.push(...transformedOrders);

      if (formattedOrders.length > 0) {
        // 
      } else {
        console.log(`No orders found for date: ${dateItem}`);
      }
    }

    const csvWriter = createCsvWriter({
      path: csvFilePath,
      header: [
          { id: "date", title: "Date" },
          { id: "orderStatus", title: "Order Status" },
          { id: "orderId", title: "Order ID" },
          { id: "invoiceNo", title: "Invoice No" },
          { id: "customerType", title: "Customer Type" },
          { id: "customerName", title: "Customer Name" },
          { id: "firstname", title: "First Name" },
          { id: "lastname", title: "Last Name" },
          { id: "mobile", title: "Mobile" },
          { id: "countryCode", title: "Country Code" },
          { id: "companyName", title: "Company Name" },
          { id: "addressType", title: "Address Type" },
          { id: "streetAddress", title: "Street Address" },
          { id: "aptSuiteUnit", title: "Apt/Suite/Unit" },
          { id: "country", title: "Country" },
          { id: "city", title: "City" },
          { id: "state", title: "State" },
          { id: "postalCode", title: "Postal Code" },
          { id: "deliveryInstruction", title: "Delivery Instructions" },
          { id: "source", title: "Source" },
          { id: "paymentMethod", title: "Payment Method" },
          { id: "paymentStatus", title: "Payment Status" },
          { id: "orderType", title: "Order Type" },
          { id: "couponCode", title: "Coupon Code" },
          { id: "currency", title: "Currency" },
          { id: "additionalCharge", title: "Additional Charge" },
          { id: "shippingCharge", title: "Shipping Charge" },
          { id: "subtotal", title: "Subtotal" },
          { id: "discount", title: "Discount" },
          { id: "couponDiscount", title: "Coupon Discount" },
          { id: "tax", title: "Tax" },
          { id: "total", title: "Total" },
          { id: "wholeTotal", title: "Grand Total" },
          { id: "priceBeforeTax", title: "Price Before Tax" },
          { id: "priceAfterTax", title: "Price After Tax" },
          { id: "giftWrapTotal", title: "Gift Wrap Total" },
          { id: "shippingNotes", title: "Shipping Notes" },
          { id: "tamaraOrderId", title: "Tamara Order ID" },
          { id: "tamaraCheckoutId", title: "Tamara Checkout ID" },
          { id: "paymentReference", title: "Payment Reference" },
          { id: "paymentGateway", title: "Payment Gateway" },
          { id: "productCount", title: "Product Count" },
          { id: "tags", title: "Tags" },
          { id: "cancelReason", title: "Cancel Reason" },
          { id: "cancelDate", title: "Cancel Date" },
          { id: "isActive", title: "Is Active" },
          { id: "isDeleted", title: "Is Deleted" }
      ],
  });
        await csvWriter.writeRecords(formattedOrders);

    // Set up file upload parameters to S3
    const fileStream = fs.createReadStream(csvFilePath);
    const uploadParams = {
      Bucket: process.env.AWS_S3BUCKET_NAME, // Your S3 bucket name
      Key: `reports/${csvFilePath}`, // File path in the bucket
      Body: fileStream,
      ContentType: "text/csv",
    };

    try {
      // Upload the CSV to S3
      const data = await s3.upload(uploadParams).promise();
      const fileUrl = data.Location;

      // Prepare the email content
      const subject = "Sales Report CSV export download link";
      const content = `<a href="${fileUrl}" target="_blank">Download</a>`;
      console.log("fileUrl",fileUrl);

      // Send the email with the link to the CSV
      try {
        const emailResponse = await mailer.sendMail(
          res.locals.user.email,
          subject,
          "",
          content
        );
      } catch (error) {
        console.log("Error caught while sending email: " + error);
      }
    } catch (error) {
      console.log("Error caught while uploading to S3: " + error);
    }
        // Return the response
        return helper.deliverResponse(res, 200, {
            data: formattedOrders,
            error_code: messages.successResponse.error_code,
            message: 'Sales report generated and uploaded successfully'
        });
    } catch (error) {
        console.log('Error caught in sale report API :: ' + error)
        helper.deliverResponse(res, 422, error, {
            error_code: messages.serverError.error_code,
            error_message: messages.serverError.error_message,
        })
    }
}
//Sale report

exports.downloadSalesReport = async (req, res) => {
    try {
        const file = process.cwd() + `/${new Date().getDate()}_${new Date().getFullYear()}_salesreport.csv`
        fs.access(file, fs.constants.F_OK, (error) => {
            if (error) {
                res.status(404).sendFile(process.cwd() + '/html/file-not-found/index.html')
            } else {
                res.download(file, `${new Date().getDate()}_${new Date().getFullYear()}_salesreport.csv`, (err) => {
                    if (err) {
                        res.status(404).send('Internal server error')
                    } else {
                        fs.unlinkSync(`${new Date().getDate()}_${new Date().getFullYear()}_salesreport.csv`);
                    }
                })
            }
        })
    } catch (_error) {
        console.log('Error caught in export order tab API :: ' + _error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

//Controller to update the product status in orders
exports.bulkOrderUpdate = async (req, res) => {
  try {
    const { body } = req;
    const { email } = res?.locals?.user;
    const orderDetails = await service.getOrderDetails({
      orderNo: body?.order,
    });
   
    const guestDetails = await guestService.findGuestById(
      orderDetails?.guestId
    );
    const settings = await settingsService.findOne({});
    let bulkShipmentProduct = body.products.map((product) => ({

     

          CustomsValue: product.total,
          Weight: product.weight || 500, // Mandatory
          Quantity: product.quantity || 1, // Optional (default 1)
          HarmonisedCode: product.productId.sku, // Optional
          GoodsDescription: product.productId.name, // Optional
          ManufactureCountryCode: "AE", // Mandatory (replace with actual ISO Alpha-2 code)
          OriginCountryCode: "AE", // Mandatory (replace with actual ISO Alpha-2 code)
          CurrencyCode: "AED", // Mandatory
          CustomsValue: product.total, // Mandatory
          DeadWeight: product.weight || 500, // Mandatory
          Reference: product.productId.sku // Mandatory (using SKU as piece reference)`


    }));

console.log("bulkShipmentProduct",bulkShipmentProduct)
     // Check if status is ACCEPTED and create shipments before updating products
     if (body.status === "ACCEPTED") {
      const shipmentResult = await PostShippingService.createBulkShipment(

        bulkShipmentProduct,

          orderDetails,

          settings

      );
      try {
          for (let product of body.products) {
              // Skip if product already has this status
              const statusExists = product.history.some(
                  (entry) => entry.status.toUpperCase() === body.status
              );
              
              if (!statusExists) {
                  try {
                      // // Calculate shipping rates
                      // const ratesResult = await PostShippingService.calculateRates(
                      //     product,
                      //     orderDetails,
                      //     settings
                      // );
                      // Create shipment
                     // create bulk product shipment

     
                      await service.updateOne(
                        {
                          orderNo: body.order,
                          "products.productId": product.productId._id,
                        },
                        {
                          "products.$.history": [
                            ...product.history,
                            { status: body.status, date: new Date() },
                          ],
                          "products.$.shipmentNumber": shipmentResult.shipmentNumber,
                          "products.$.shipmentLogs": [shipmentResult.log]
                        }
                      );
                  } catch (error) {
                      console.error('Shipping creation failed for product:', error);
                      // Store error log if available
                      if (error.log) {
                          await service.updateOne(
                              {
                                  orderNo: body.order,
                                  "products.productId": product.productId._id,
                              },
                              {
                                  $push: {
                                      "products.$.shipmentLogs": error.log
                                  }
                              }
                          );
                      }
                      // Continue with next product even if shipping fails
                  }
              }
          }
      } catch (error) {
          console.error('Error in shipping creation:', error);
          // Continue with order update even if shipping creation fails
      }
  }

    for (let product of body.products) {
      const statusExists =
        product.history.some(
          (entry) => entry.status.toUpperCase() === body.status
        ) || false;
      if (statusExists) {
      } else {
        if (body.status != "DELIVERED" && body.status != "ACCEPTED") {
          await service.updateOne(
            {
              orderNo: body.order,
              "products.productId": product.productId._id,
            },
            {
              "products.$.history": [
                ...product.history,
                { status: body.status, date: new Date() },
              ],
            }
          );
        } else {
          if (orderDetails.paymentMethod == "COD" && body.status != "ACCEPTED") {
            await service.updateOne(
              {
                orderNo: body.order,
                "products.productId": product.productId._id,
              },
              {
                "products.$.history": [
                  ...product.history,
                  { status: body.status, date: new Date() },
                ],
                "products.$.paymentStatus": "PAID",
              }
            );
          } else {
            await service.updateOne(
              {
                orderNo: body.order,
                "products.productId": product.productId._id,
              },
              {
                "products.$.history": [
                  ...product.history,
                  { status: body.status, date: new Date() },
                ],
              }
            );
          }
        }
      }
    }

    let payload = { orderStatus: body.status };
    if (
      body.status == "DELIVERED" &&
      (orderDetails.paymentMethod == "COD" ||
        orderDetails.paymentMethod == "CARD")
    ) {
      payload = { orderStatus: body.status, paymentStatus: "PAID" };
    }

    if (body.status == "CANCELLED") {
      payload["cancel"] = {
        reason: "Order cancelled from store",
        date: new Date(),
      };
    }

   
    const helpDetails = await helpService.findOne();
    const response = await service.updateOne({ orderNo: body.order }, payload);
    const customerDetails = await customerService.getCustomer({
      _id: orderDetails?.customerId,
    });

    const templateData = {
      orderNo: orderDetails.orderNo,
      orderDate: new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }).format(new Date(orderDetails.createdAt)),
      customerName: customerDetails?.name || guestDetails?.name || "",
      storeName: settings.name,
      orderTotal: settings.currency + " " + orderDetails?.wholeTotal,
      supportEmail: helpDetails?.email,
      supportPhone: helpDetails?.phone,
      primaryColor: settings?.colors?.primary || "#000000",
      logoUrl: BASE_URL + settings.logo,
      downloadUrl:
        BASE_URL + "api/v1/w/invoice/" + orderDetails.orderNo.split("#")[1],
    };

    switch (body.status) {
      case "DELIVERED":
        const deliveredSubject = `Your order ${orderDetails?.orderNo} has been delivered`;
        const deliveredContent = `Your order ${orderDetails?.orderNo} has been delivered`;
        const deliveredTemplate = await templates.orderDelivered(templateData);
        // await mailer.sendMail(
        //   customerDetails?.email || guestDetails?.email,
        //   deliveredSubject,
        //   deliveredContent,
        //   deliveredTemplate
        // );
        await notificationService.create({
          customers: [customerDetails?._id],
          title: "Order delivered",
          content: "Order " + orderDetails?.orderNo + " has been delivered",
          channel: "push",
          type: "instant",
          redirection:
            settings?.domain +
            "/order-detail/" +
            orderDetails?.orderNo.split("#")[1],
          status: "sent",
        });
        break;
      case "ACCEPTED":
        const acceptedSubject = `Your order ${orderDetails?.orderNo} has been accepted`;
        const acceptedContent = `Your order ${orderDetails?.orderNo} has been accepted`;
        const acceptedTemplate = await templates.orderAccepted(templateData);
        console.log("guestDetails", guestDetails);

        // await mailer.sendMail(
        //   customerDetails?.email || guestDetails?.email,
        //   acceptedSubject,
        //   acceptedContent,
        //   acceptedTemplate
        // );
        if (customerDetails?.deviceTokens.length > 0) {
          let pushMessage = {
            tokens: customerDetails?.deviceTokens,
            notification: {
              title: "Order accepted",
              body: "Order " + orderDetails?.orderNo + " has been accepted",
            },
            webpush: {
              fcm_options: {
                link: "/order-detail/" + orderDetails?.orderNo.split("#")[1],
              },
            },
          };

          admin
            .messaging()
            .sendEachForMulticast(pushMessage)
            .then(async (response) => {
              await notificationService.create({
                customers: [customerDetails?._id],
                title: "Order accepted",
                content:
                  "Order " + orderDetails?.orderNo + " has been accepted",
                channel: "push",
                type: "instant",
                redirection:
                  settings?.domain +
                  "/order-detail/" +
                  orderDetails?.orderNo.split("#")[1],
                status: "sent",
              });
            })
            .catch((error) => {
              console.log(error);
            });
        }
        break;
      case "CANCELLED":
        const cancelledSubject = `Your order ${orderDetails?.orderNo} has been cancelled`;
        const cancelledContent = `Your order ${orderDetails?.orderNo} has been cancelled`;
        const cancelledTemplate = await templates.orderCancelled(templateData);
        // await mailer.sendMail(
        //   customerDetails?.email || guestDetails?.email,
        //   cancelledSubject,
        //   cancelledContent,
        //   cancelledTemplate
        // );
        if (customerDetails?.deviceTokens.length > 0) {
          let pushMessage = {
            tokens: customerDetails?.deviceTokens,
            notification: {
              title: "Order Cancelled",
              body: "Order " + orderDetails?.orderNo + " has been cancelled",
            },
            webpush: {
              fcm_options: {
                link: "/order-detail/" + orderDetails?.orderNo.split("#")[1],
              },
            },
          };

          admin
            .messaging()
            .sendEachForMulticast(pushMessage)
            .then(async (response) => {
              await notificationService.create({
                customers: [customerDetails?._id],
                title: "Order cancelled",
                content:
                  "Order " + orderDetails?.orderNo + " has been cancelled",
                channel: "push",
                type: "instant",
                redirection:
                  settings?.domain +
                  "/order-detail/" +
                  orderDetails?.orderNo.split("#")[1],
                status: "sent",
              });
            })
            .catch((error) => {
              console.log(error);
            });
        }
        break;
      case "OUT FOR DELIVERY":
        if (customerDetails?.deviceTokens.length > 0) {
          let pushMessage = {
            tokens: customerDetails?.deviceTokens,
            notification: {
              title: orderDetails?.orderNo + " Out for delivery🤩",
              body: "Your order is out for delivery and will be delivered to you by today.",
            },
            webpush: {
              fcm_options: {
                link: "/order-detail/" + orderDetails?.orderNo.split("#")[1],
              },
            },
          };

          admin
            .messaging()
            .sendEachForMulticast(pushMessage)
            .then(async (response) => {
              await notificationService.create({
                customers: [customerDetails?._id],
                title: orderDetails?.orderNo + " Out for delivery🤩",
                content:
                  "Your order is out for delivery and will be delivered to you by today.",
                channel: "push",
                type: "instant",
                redirection:
                  settings?.domain +
                  "/order-detail/" +
                  orderDetails?.orderNo.split("#")[1],
                status: "sent",
              });
            })
            .catch((error) => {
              console.log(error);
            });
        }
        break;
    }

        if (response instanceof Error) {
            helper.deliverResponse(res, 422, {}, {
                "error_code": messages.serverError.error_code,
                "error_message": messages.serverError.error_message
            });
        } else {
            activity.logActivity(email, `Order status updated for ${body.order}`)
            helper.deliverResponse(res, 200, {}, {
                error_code: messages.ORDER_STATUS_UPDATED.error_code,
                error_message: messages.ORDER_STATUS_UPDATED.error_message,
            });
        }
    } catch (_error) {
        console.log('Error caught in bulk order update API :: ' + _error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

// exports.oneTimePurchase = async (req, res) => {
//     const singleOrderCustomers = await db.Order.aggregate([
//           {
//               $match: { isDelete: false }
//           },
//         {
//               $group: {
//                   _id: "$customerId",
//                   orderCount: { $sum: 1 },
//                   orderNos: { $first: "$orderNo" },
//                   totalAmount: {
//                       $sum: {
//                           $toDouble: "$total"
//                       }
//                   }
//               }
//           },
//           {
//               $match: { orderCount: 1 }
//           },
//           {
//               $lookup: {
//                   from: "customers", // Name of the customers collection
//                   localField: "_id", // customerId from orders (renamed to _id in group)
//                   foreignField: "_id", // matching field in customers collection
//                   as: "customerInfo"
//               }
//           },
//           // Unwind customerInfo array to get a single object with customer details
//           {
//               $unwind: "$customerInfo"
//           },
//           // Project to format the final output
//           {
//               $project: {
//                   customerId: "$_id",
//                   orderCount: 1,
//                   orderNos: 1,
//                   totalAmount: 1,
//                   customerName: "$customerInfo.name", // Assuming the customer's name field is `name`
//                   mobile: "$customerInfo.mobile", // Assuming customer's mobile field is `mobile`
//                   email: "$customerInfo.email" // Assuming customer's email field is `email`
//               }
//           }
//       ]);

//       // Prepare the report data
//       const reportData = singleOrderCustomers.map(customer => {
//           return {
//               customer: customer.customerName,
//               mobile: customer.mobile,
//               email: customer.email,
//               orderNos: customer.orderNos,
//               totalAmount: customer.totalAmount,
//               createdAt: new Date(customer._id.getTimestamp()).toLocaleString('en-US', { timeZone: 'Asia/Dubai' }), // Assuming the `createdAt` comes from the `_id` timestamp
//               updatedAt: new Date().toLocaleString('en-US', { timeZone: 'Asia/Dubai' }) // Using current time as updatedAt
//           };
//       });

//       // Create CSV file path
//       const csvFilePath = `${Date.now()}_oneTimePurchase.csv`;

//       // Create a CSV writer and write the records to the CSV file
//       const csvWriter = createCsvWriter({
//           path: csvFilePath,
//           header: [
//               { id: 'customer', title: 'Customer' },
//               { id: 'mobile', title: 'Mobile' },
//               { id: 'email', title: 'Email' },
//               { id: 'orderNos', title: 'Order Nos' },
//               { id: 'totalAmount', title: 'Total Amount' },
//               { id: 'createdAt', title: 'Created At' },
//               { id: 'updatedAt', title: 'Updated At' }
//           ]
//       });

//       await csvWriter.writeRecords(reportData);

//       // Set up file upload parameters to S3
//       const fileStream = fs.createReadStream(csvFilePath);
//       const uploadParams = {
//           Bucket: process.env.AWS_S3BUCKET_NAME, // Your S3 bucket name
//           Key: `reports/${csvFilePath}`, // File path in the bucket
//           Body: fileStream,
//           ContentType: 'text/csv',
//       };

//       try {
//           // Upload the CSV to S3
//           const data = await s3.upload(uploadParams).promise();
//           const fileUrl = data.Location;

//           // Prepare the email content
//           const subject = 'One Time Purchase report CSV export download link';
//           const content = `<a href="${fileUrl}" target="_blank">Download</a>`;

//           // Send the email with the link to the CSV
//           try {
//               const emailResponse = await sendMail(res.locals.user.email, subject, '', content);
//           } catch (error) {
//               console.log('Error caught while sending email: ' + error);
//           }
//       } catch (error) {
//           console.log('Error caught while uploading to S3: ' + error);
//       }

//       // Return the response
//       return helper.deliverResponse(res, 200, {
//           singleOrderCustomers,
//           error_code: messages.successResponse.error_code,
//           error_message: messages.successResponse.error_message,
//       });
//   };
exports.oneTimePurchase = async (req, res) => {
  const singleOrderCustomers = await db.Order.aggregate([
    {
      $match: { isDelete: false },
    },
    {
      $group: {
        _id: "$customerId",
        orderCount: { $sum: 1 },
        orderNos: { $first: "$orderNo" },
        totalAmount: {
          $sum: {
            $toDouble: "$total",
          },
        },
        products: { $first: "$products" }, // Store the products array from the order
      },
    },
    {
      $match: { orderCount: 1 },
    },
    {
      $lookup: {
        from: "customers",
        localField: "_id",
        foreignField: "_id",
        as: "customerInfo",
      },
    },
    {
      $unwind: "$customerInfo",
    },
    // Lookup products to get product names based on product IDs in the `products` array
    {
      $lookup: {
        from: "products",
        localField: "products.productId", // `products.productId` is the field we want to match
        foreignField: "_id",
        as: "productDetails", // This will contain details of each product
      },
    },
    // Project to format the final output
    {
      $project: {
        customerId: "$_id",
        orderCount: 1,
        orderNos: 1,
        totalAmount: 1,
        customerName: "$customerInfo.name",
        mobile: "$customerInfo.mobile",
        email: "$customerInfo.email",
        productNames: "$productDetails.name", // Assuming each product has a `name` field
      },
    },
  ]);

  // Prepare the report data
  const reportData = singleOrderCustomers.map((customer) => {
    return {
      customer: customer.customerName,
      mobile: customer.mobile,
      email: customer.email,
      orderNos: customer.orderNos,
      totalAmount: customer.totalAmount,
      productNames: customer.productNames.join(", "), // Join product names for CSV output
      createdAt: new Date(customer._id.getTimestamp()).toLocaleString("en-US", {
        timeZone: "Asia/Dubai",
      }),
      updatedAt: new Date().toLocaleString("en-US", { timeZone: "Asia/Dubai" }),
    };
  });

  // Create CSV file path
  const csvFilePath = `${Date.now()}_oneTimePurchase.csv`;

  // Create a CSV writer and write the records to the CSV file
  const csvWriter = createCsvWriter({
    path: csvFilePath,
    header: [
      { id: "customer", title: "Customer" },
      { id: "mobile", title: "Mobile" },
      { id: "email", title: "Email" },
      { id: "orderNos", title: "Order Nos" },
      { id: "totalAmount", title: "Total Amount" },
      { id: "productNames", title: "Product Names" },
      { id: "createdAt", title: "Created At" },
      { id: "updatedAt", title: "Updated At" },
    ],
  });

  await csvWriter.writeRecords(reportData);

  const fileStream = fs.createReadStream(csvFilePath);
  const uploadParams = {
    Bucket: process.env.AWS_S3BUCKET_NAME,
    Key: `reports/${csvFilePath}`,
    Body: fileStream,
    ContentType: "text/csv",
  };

  try {
    const data = await s3.upload(uploadParams).promise();
    const fileUrl = data.Location;

    const subject = "One Time Purchase report CSV export download link";
    const content = `<a href="${fileUrl}" target="_blank">Download</a>`;

    try {
      await sendMail(res.locals.user.email, subject, "", content);
    } catch (error) {
      console.log("Error caught while sending email: " + error);
    }
  } catch (error) {
    console.log("Error caught while uploading to S3: " + error);
  }

    return helper.deliverResponse(res, 200, {
        singleOrderCustomers,
        error_code: messages.successResponse.error_code,
        error_message: messages.successResponse.error_message,
    });
};

exports.ordersReport = async (req, res) => {
  try {
    const report = await db.Order.aggregate([
      {
        $group: {
          _id: null, // Grouping everything into one result
          totalCount: { $sum: 1 }, // Count all orders
          deliveredCount: {
            $sum: {
              $cond: [{ $eq: ["$orderStatus", "DELIVERED"] }, 1, 0],
            },
          },
          shippingCount: {
            $sum: {
              $cond: [{ $eq: ["$orderStatus", "SHIPPED"] }, 1, 0],
            },
          },
          returnCount: {
            $sum: {
              $cond: [{ $eq: ["$orderStatus", "RETURNED"] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0, // Hide the original _id
          totalCount: 1,
          deliveredCount: 1,
          shippingCount: 1,
          returnCount: 1,
        },
      },
    ]);

    // Prepare the report data in the required format
    const reportData =
      report.length > 0
        ? report[0]
        : {
            totalCount: 0,
            deliveredCount: 0,
            shippingCount: 0,
            returnCount: 0,
          };

    const csvData = [
      {
        totalCount: reportData.totalCount,
        deliveredCount: reportData.deliveredCount,
        shippingCount: reportData.shippingCount,
        returnCount: reportData.returnCount,
      },
    ];

    // Create CSV file path
    const csvFilePath = `${Date.now()}_ordersReport.csv`;

    // Create a CSV writer and write the records to the CSV file
    const csvWriter = createCsvWriter({
      path: csvFilePath,
      header: [
        { id: "totalCount", title: "Total Count" },
        { id: "deliveredCount", title: "Delivered Count" },
        { id: "shippingCount", title: "Shipping Count" },
        { id: "returnCount", title: "Return Count" },
      ],
    });

    await csvWriter.writeRecords(csvData);

    // Set up file upload parameters to S3
    const fileStream = fs.createReadStream(csvFilePath);
    const uploadParams = {
      Bucket: process.env.AWS_S3BUCKET_NAME, // Your S3 bucket name
      Key: `reports/${csvFilePath}`, // File path in the bucket
      Body: fileStream,
      ContentType: "text/csv",
    };

    try {
      // Upload the CSV to S3
      const data = await s3.upload(uploadParams).promise();
      const fileUrl = data.Location;

      // Prepare the email content
      const subject = "Order Report CSV export download link";
      const content = `<a href="${fileUrl}" target="_blank">Download</a>`;

      // Send the email with the link to the CSV
      try {
        const emailResponse = await sendMail(
          res.locals.user.email,
          subject,
          "",
          content
        );
      } catch (error) {
        console.log("Error caught while sending email: " + error);
      }
    } catch (error) {
      console.log("Error caught while uploading to S3: " + error);
    }

        // Return the response
        return helper.deliverResponse(res, 200, {
            data: reportData,
            error_code: messages.successResponse.error_code,
            message: 'Order report generated and uploaded successfully'
        });

    } catch (error) {
        res.status(500).json({
            error_code: 1,
            message: 'Error generating order report',
            error: error.message
        });
    }
};

// exports.financeReport = async (req, res) => {
//   try {
//     // Aggregation pipeline for finance report
//     const report = await db.Order.aggregate([
//       {
//         $unwind: "$products",
//       },
//       {
//         $group: {
//           _id: null,
//           totalOrders: { $sum: 1 },
//           grossSales: { $sum: { $toDouble: "$products.baseTotal" } },
//           discountTotal: { $sum: { $toDouble: "$discount" } },
//           shippingCostTotal: { $sum: { $toDouble: "$shippingCost" } },
//           giftCardSales: {
//             $sum: {
//               $cond: [
//                 { $eq: ["$products.isGift", true] },
//                 { $toDouble: "$products.total" },
//                 0,
//               ],
//             },
//           },
//           netSalesWithCost: { $sum: { $toDouble: "$total" } },
//           totalReturns: {
//             $sum: {
//               $cond: [
//                 { $eq: ["$orderStatus", "RETURNED"] },
//                 { $toDouble: "$products.total" },
//                 0,
//               ],
//             },
//           },
//         },
//       },
//       {
//         $project: {
//           _id: 0,
//           totalOrders: 1,
//           grossSales: 1,
//           discountTotal: 1,
//           giftCardSales: 1,
//           netSales: { $subtract: ["$grossSales", "$discountTotal"] },
//           netSalesWithCost: 1,
//           totalReturns: 1,
//           shippingCostTotal: 1,
//           grossProfit: {
//             $subtract: ["$netSales", "$totalReturns"],
//           },
//           totalSales: { $sum: ["$netSales", "$shippingCostTotal"] },
//         },
//       },
//     ]);

//     const reportData =
//       report.length > 0
//         ? report[0]
//         : {
//             totalOrders: 0,
//             grossSales: 0,
//             discountTotal: 0,
//             giftCardSales: 0,
//             netSales: 0,
//             netSalesWithCost: 0,
//             totalReturns: 0,
//             shippingCostTotal: 0,
//             grossProfit: 0,
//             totalSales: 0,
//           };

//     // Prepare data for CSV
//     const csvData = [
//       {
//         totalOrders: reportData.totalOrders,
//         grossSales: reportData.grossSales,
//         discountTotal: reportData.discountTotal,
//         giftCardSales: reportData.giftCardSales,
//         netSales: reportData.netSales,
//         netSalesWithCost: reportData.netSalesWithCost,
//         totalReturns: reportData.totalReturns,
//         shippingCostTotal: reportData.shippingCostTotal,
//         grossProfit: reportData.grossProfit,
//         totalSales: reportData.totalSales,
//       },
//     ];

//     // Create CSV file path
//     const csvFilePath = `${Date.now()}_financeReport.csv`;

//     // Create a CSV writer and write the records to the CSV file
//     const csvWriter = createCsvWriter({
//       path: csvFilePath,
//       header: [
//         { id: "totalOrders", title: "Total Orders" },
//         { id: "grossSales", title: "Gross Sales" },
//         { id: "discountTotal", title: "Discount Total" },
//         { id: "giftCardSales", title: "Gift Card Sales" },
//         { id: "netSales", title: "Net Sales" },
//         { id: "netSalesWithCost", title: "Net Sales with Cost" },
//         { id: "totalReturns", title: "Total Returns" },
//         { id: "shippingCostTotal", title: "Shipping Cost Total" },
//         { id: "grossProfit", title: "Gross Profit" },
//         { id: "totalSales", title: "Total Sales" },
//       ],
//     });

//     await csvWriter.writeRecords(csvData);

//     // Set up file upload parameters to S3
//     const fileStream = fs.createReadStream(csvFilePath);
//     const uploadParams = {
//       Bucket: process.env.AWS_S3BUCKET_NAME,
//       Key: `reports/${csvFilePath}`,
//       Body: fileStream,
//       ContentType: "text/csv",
//     };

//     try {
//       // Upload the CSV to S3
//       const data = await s3.upload(uploadParams).promise();
//       const fileUrl = data.Location;

//       // Prepare the email content
//       const subject = "Finance Report CSV export download link";
//       const content = `<a href="${fileUrl}" target="_blank">Download</a>`;

//       // Send the email with the link to the CSV
//       try {
//         const emailResponse = await sendMail(
//           res.locals.user.email,
//           subject,
//           "",
//           content
//         );
//       } catch (error) {
//         console.log("Error caught while sending email: " + error);
//       }
//     } catch (error) {
//       console.log("Error caught while uploading to S3: " + error);
//     }

//         // Return the response
//         return helper.deliverResponse(res, 200, {
//             data: reportData,
//             error_code: messages.successResponse.error_code,
//             message: 'Finance report generated and uploaded successfully'
//         });

//     } catch (error) {
//         res.status(500).json({
//             error_code: 1,
//             message: 'Error generating finance report',
//             error: error.message
//         });
//     }
// };
exports.financeReport = async (req, res) => {
  try {
    const report = await db.Order.aggregate([
      {
        $unwind: "$products"
      },
      {
        $lookup: {
          from: "products",
          localField: "products.productId",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      {
        $addFields: {
          "productInfo": { $arrayElemAt: ["$productDetails", 0] }
        }
      },
      {
        $facet: {
          "monthlySales": [
            {
              $group: {
                _id: { 
                  month: { $month: "$createdAt" },
                  paymentMethod: "$paymentMethod",
                  category: "$productInfo.category"
                },
                amount: { $sum: { $toDouble: "$products.baseTotal" } },
                count: { $sum: 1 } // Count transactions per payment method
              }
            }
          ],
          "mainCalculations": [
            {
              $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                grossSales: { $sum: { $toDouble: "$products.baseTotal" } },
                mrpTotal: {
                  $sum: {
                    $multiply: [
                      { $toDouble: "$products.quantity" },
                      { $toDouble: { $ifNull: ["$productInfo.price.mrp", 0] } }
                    ]
                  }
                },
                offerTotal: {
                  $sum: {
                    $multiply: [
                      { $toDouble: "$products.quantity" },
                      { $toDouble: { $ifNull: ["$productInfo.price.offer", 0] } }
                    ]
                  }
                },
                costOfGoodsSold: {
                  $sum: {
                    $multiply: [
                      { $toDouble: "$products.quantity" },
                      { $toDouble: { $ifNull: ["$productInfo.price.production", 0] } }
                    ]
                  }
                },
                regularDiscount: { $sum: { $toDouble: { $ifNull: ["$discount", 0] } } },
                couponDiscount: { $sum: { $toDouble: { $ifNull: ["$couponDiscount", 0] } } },
                totalReturns: {
                  $sum: {
                    $cond: [
                      { $eq: ["$orderStatus", "RETURNED"] },
                      { $toDouble: { $ifNull: ["$products.total", 0] } },
                      0
                    ]
                  }
                },
                shippingTotal: { $sum: { $toDouble: { $ifNull: ["$additionalCharge", 0] } } },
                paymentMethods: {
                  $push: {
                    method: "$paymentMethod",
                    amount: { $toDouble: "$products.baseTotal" }
                  }
                }
              }
            }
          ]
        }
      },
      {
        $project: {
          summary: {
            totalOrders: { $ifNull: [{ $first: "$mainCalculations.totalOrders" }, 0] },
            grossSales: { $ifNull: [{ $first: "$mainCalculations.grossSales" }, 0] },
            mrpTotal: { $ifNull: [{ $first: "$mainCalculations.mrpTotal" }, 0] },
            offerTotal: { $ifNull: [{ $first: "$mainCalculations.offerTotal" }, 0] },
            netSales: { $ifNull: [{ $first: "$mainCalculations.grossSales" }, 0] },
            totalReturns: { $ifNull: [{ $first: "$mainCalculations.totalReturns" }, 0] }
          },
          grossPaymentsByMonth: {
            $map: {
              input: {
                $filter: {
                  input: "$monthlySales",
                  as: "sale",
                  cond: { $ne: ["$$sale._id.month", null] }
                }
              },
              as: "monthSale",
              in: {
                month: "$$monthSale._id.month",
                amount: "$$monthSale.amount"
              }
            }
          },
          paymentsByType: {
            $map: {
              input: {
                $filter: {
                  input: "$monthlySales",
                  as: "sale",
                  cond: { $ne: ["$$sale._id.paymentMethod", null] }
                }
              },
              as: "paymentSale",
              in: {
                type: "$$paymentSale._id.paymentMethod",
                amount: "$$paymentSale.amount",
                count: "$$paymentSale.count" // Payment transaction count
              }
            }
          },
          paymentTransactions: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: "$monthlySales",
                    as: "sale",
                    cond: { $ne: ["$$sale._id.paymentMethod", null] }
                  }
                },
                as: "paymentSale",
                in: "$$paymentSale.count"
              }
            }
          },
          categoryWiseSales: {
            $map: {
              input: {
                $filter: {
                  input: "$monthlySales",
                  as: "sale",
                  cond: { $ne: ["$$sale._id.category", null] }
                }
              },
              as: "categorySale",
              in: {
                category: "$$categorySale._id.category",
                amount: "$$categorySale.amount"
              }
            }
          },
          costOfGoodsSold: { $ifNull: [{ $first: "$mainCalculations.costOfGoodsSold" }, 0] },
          discounts: {
            offerDiscount: {
              $ifNull: [
                { 
                  $subtract: [
                    { $ifNull: [{ $first: "$mainCalculations.mrpTotal" }, 0] },
                    { $ifNull: [{ $first: "$mainCalculations.offerTotal" }, 0] }
                  ]
                }, 
                0
              ]
            },
            regularDiscount: { $ifNull: [{ $first: "$mainCalculations.regularDiscount" }, 0] },
            couponDiscount: { $ifNull: [{ $first: "$mainCalculations.couponDiscount" }, 0] },
            total: {
              $ifNull: [
                {
                  $add: [
                    {
                      $subtract: [
                        { $ifNull: [{ $first: "$mainCalculations.mrpTotal" }, 0] },
                        { $ifNull: [{ $first: "$mainCalculations.offerTotal" }, 0] }
                      ]
                    },
                    { $ifNull: [{ $first: "$mainCalculations.regularDiscount" }, 0] },
                    { $ifNull: [{ $first: "$mainCalculations.couponDiscount" }, 0] }
                  ]
                },
                0
              ]
            }
          },
          grossProfit: {
            $ifNull: [
              {
                $subtract: [
                  { $ifNull: [{ $first: "$mainCalculations.grossSales" }, 0] },
                  { $ifNull: [{ $first: "$mainCalculations.costOfGoodsSold" }, 0] }
                ]
              },
              0
            ]
          },
          netSales: {
            withCost: { $ifNull: [{ $first: "$mainCalculations.grossSales" }, 0] },
            withoutCost: {
              $ifNull: [
                {
                  $subtract: [
                    { $ifNull: [{ $first: "$mainCalculations.grossSales" }, 0] },
                    { $ifNull: [{ $first: "$mainCalculations.costOfGoodsSold" }, 0] }
                  ]
                },
                0
              ]
            }
          },
          returns: { $ifNull: [{ $first: "$mainCalculations.totalReturns" }, 0] },
          shipping: { $ifNull: [{ $first: "$mainCalculations.shippingTotal" }, 0] },
          totalSales: { $ifNull: [{ $first: "$mainCalculations.grossSales" }, 0] },
          grossSales: { $ifNull: [{ $first: "$mainCalculations.grossSales" }, 0] },
          productDetails: { $first: "$mainCalculations.productDetails" }
        }
      }
    ]);

    const reportData = report.length > 0 ? report[0] : {
      summary: {
        totalOrders: 0,
        grossSales: 0,
        mrpTotal: 0,
        offerTotal: 0,
        netSales: 0,
        totalReturns: 0
      },
      grossPaymentsByMonth: [],
      paymentsByType: [],
      paymentTransactions: 0,
      categoryWiseSales: [],
      costOfGoodsSold: 0,
      discounts: {
        offerDiscount: 0,
        regularDiscount: 0,
        couponDiscount: 0,
        total: 0
      },
      grossProfit: 0,
      netSales: {
        withCost: 0,
        withoutCost: 0
      },
      returns: 0,
      shipping: 0,
      totalSales: 0,
      grossSales: 0,
      productDetails: []
    };

    console.log(reportData, "report data");

    // Extract payment method breakdown
    const paymentBreakdown = {};
    reportData.paymentsByType.forEach(payment => {
      paymentBreakdown[`Payment - ${payment.type}`] = payment.amount || 0;
      paymentBreakdown[`Transactions - ${payment.type}`] = payment.count || 0;
    });

    // Prepare flattened data for CSV
    const flattenedData = {
      "Total Orders": reportData.summary.totalOrders,
      "Gross Sales": reportData.summary.grossSales,
      "Cost of Goods Sold": reportData.costOfGoodsSold,
      "Net Sales with Cost": reportData.netSales.withCost,
      "Net Sales without Cost": reportData.netSales.withoutCost,
      "Offer Discounts": reportData.discounts.offerDiscount,
      "Regular Discounts": reportData.discounts.regularDiscount,
      "Coupon Discounts": reportData.discounts.couponDiscount,
      "Total Discounts": reportData.discounts.total,
      "Total Payment Transactions": reportData.paymentTransactions || 0,
      "Shipping Costs": reportData.shipping,
      "Total MRP Value": reportData.summary.mrpTotal,
      "Total Offer Value": reportData.summary.offerTotal,
      "Gross Profit": reportData.grossProfit,
      "Returns": reportData.returns,
      "Total Sales": reportData.totalSales,
      ...paymentBreakdown
    };

    // Create a dynamic header list based on all properties in flattenedData
    const headerList = Object.keys(flattenedData).map(key => ({
      id: key,
      title: key
    }));

    const csvFilePath = `${Date.now()}_financeReport.csv`;

    const csvWriter = createCsvWriter({
      path: csvFilePath,
      header: headerList
    });

    await csvWriter.writeRecords([flattenedData]);

    const fileStream = fs.createReadStream(csvFilePath);
    const uploadParams = {
      Bucket: process.env.AWS_S3BUCKET_NAME,
      Key: `reports/${csvFilePath}`,
      Body: fileStream,
      ContentType: "text/csv"
    };

    try {
      const data = await s3.upload(uploadParams).promise();
      const fileUrl = data.Location;

      const subject = "Finance Report CSV export download link";
      const content = `<a href="${fileUrl}" target="_blank">Download</a>`;

      await sendMail(res.locals.user.email, subject, "", content);
    } catch (error) {
      console.log("Error in file upload or email sending:", error);
    }

    return helper.deliverResponse(res, 200, {
      data: reportData,
      error_code: messages.successResponse.error_code,
      message: 'Finance report generated and uploaded successfully'
    });

  } catch (error) {
    res.status(500).json({
      error_code: 1,
      message: 'Error generating finance report',
      error: error.message
    });
  }
};

exports.couponReport = async (req, res) => {
  try {
    const result = await db.Order.aggregate([
      {
        $unwind: "$coupons", // Unwind the coupons array to handle multiple coupons per order
      },
      {
        $lookup: {
          from: "products", // Lookup product details from the products collection
          localField: "products.productId",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $group: {
          _id: "$coupons.code", // Group by coupon code
          usageCount: { $sum: 1 }, // Count occurrences for each coupon
          totalRevenue: { $sum: "$total" }, // Sum total revenue per coupon
          redeemedProducts: { $push: "$productDetails.name" }, // Collect product names
        },
      },
      {
        $sort: { usageCount: -1 }, // Sort by usage count in descending order
      },
      {
        $project: {
          couponCode: "$_id",
          usageCount: 1,
          totalRevenue: 1,
          redeemedProducts: { $slice: ["$redeemedProducts", 5] }, // Limit to top 5 products
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to generate coupon report",
      error: error.message,
    });
  }
};

// exports.financeReport = async (req, res) => {
//   try {
//     const report = await db.Order.aggregate([
//       {
//         $unwind: "$products"
//       },
//       {
//         $lookup: {
//           from: "products",
//           localField: "products.productId",
//           foreignField: "_id",
//           as: "productDetails"
//         }
//       },
//       {
//         $addFields: {
//           "productInfo": { $arrayElemAt: ["$productDetails", 0] }
//         }
//       },
//       {
//         $facet: {
//           "monthlySales": [
//             {
//               $group: {
//                 _id: { 
//                   month: { $month: "$createdAt" },
//                   paymentMethod: "$paymentMethod",
//                   category: "$productInfo.category"
//                 },
//                 amount: { $sum: { $toDouble: "$products.baseTotal" } }
//               }
//             }
//           ],
//           "mainCalculations": [
//             {
//               $group: {
//                 _id: "$_id",
//                 products: {
//                   $push: {
//                     productId: "$productInfo._id",
//                     sku: "$productInfo.sku",
//                     name: "$productInfo.name",
//                     category: "$productInfo.category",
//                     prices: {
//                       mrp: "$productInfo.price.mrp",
//                       offer: "$productInfo.price.offer",
//                       production: "$productInfo.price.production"
//                     },
//                     quantity: "$products.quantity",
//                     grossAmount: "$products.baseTotal",
//                     netAmount: { 
//                       $subtract: [
//                         "$products.baseTotal",
//                         { $add: [
//                           { $toDouble: "$discount" },
//                           {
//                             $subtract: [
//                               { $multiply: ["$products.quantity", "$productInfo.price.mrp"] },
//                               { $multiply: ["$products.quantity", "$productInfo.price.offer"] }
//                             ]
//                           }
//                         ]}
//                       ]
//                     },
//                     offerDiscount: {
//                       $subtract: [
//                         { $multiply: ["$products.quantity", "$productInfo.price.mrp"] },
//                         { $multiply: ["$products.quantity", "$productInfo.price.offer"] }
//                       ]
//                     }
//                   }
//                 },
//                 grossSales: { $sum: { $toDouble: "$products.baseTotal" } },
//                 mrpTotal: {
//                   $sum: {
//                     $multiply: [
//                       "$products.quantity",
//                       { $ifNull: ["$productInfo.price.mrp", 0] }
//                     ]
//                   }
//                 },
//                 offerTotal: {
//                   $sum: {
//                     $multiply: [
//                       "$products.quantity",
//                       { $ifNull: ["$productInfo.price.offer", 0] }
//                     ]
//                   }
//                 },
//                 costOfGoodsSold: {
//                   $sum: {
//                     $multiply: [
//                       "$products.quantity",
//                       { $ifNull: ["$productInfo.price.production", 0] }
//                     ]
//                   }
//                 },
//                 regularDiscount: { $sum: { $toDouble: "$discount" } },
//                 couponDiscount: { $sum: { $toDouble: "$couponDiscount" } },
//                 totalReturns: {
//                   $sum: {
//                     $cond: [
//                       { $eq: ["$orderStatus", "RETURNED"] },
//                       { $toDouble: "$products.total" },
//                       0
//                     ]
//                   }
//                 },
//                 shippingTotal: { $sum: { $toDouble: "$additionalCharge" } }
//               }
//             },
//             {
//               $group: {
//                 _id: null,
//                 totalOrders: { $sum: 1 },
//                 grossSales: { $sum: "$grossSales" },
//                 mrpTotal: { $sum: "$mrpTotal" },
//                 offerTotal: { $sum: "$offerTotal" },
//                 costOfGoodsSold: { $sum: "$costOfGoodsSold" },
//                 regularDiscount: { $sum: "$regularDiscount" },
//                 couponDiscount: { $sum: "$couponDiscount" },
//                 totalReturns: { $sum: "$totalReturns" },
//                 shippingTotal: { $sum: "$shippingTotal" },
//                 productDetails: { $push: { $arrayElemAt: ["$products", 0] } }
//               }
//             }
//           ]
//         }
//       },
//       {
//         $project: {
//           summary: {
//             totalOrders: { $first: "$mainCalculations.totalOrders" },
//             grossSales: { $first: "$mainCalculations.grossSales" },
//             mrpTotal: { $first: "$mainCalculations.mrpTotal" },
//             offerTotal: { $first: "$mainCalculations.offerTotal" },
//             netSales: { $first: "$mainCalculations.grossSales" },
//             totalReturns: { $first: "$mainCalculations.totalReturns" }
//           },
//           grossPaymentsByMonth: {
//             $map: {
//               input: {
//                 $filter: {
//                   input: "$monthlySales",
//                   as: "sale",
//                   cond: { $ne: ["$$sale._id.month", null] }
//                 }
//               },
//               as: "monthSale",
//               in: {
//                 month: "$$monthSale._id.month",
//                 amount: "$$monthSale.amount"
//               }
//             }
//           },
//           paymentsByType: {
//             $map: {
//               input: {
//                 $filter: {
//                   input: "$monthlySales",
//                   as: "sale",
//                   cond: { $ne: ["$$sale._id.paymentMethod", null] }
//                 }
//               },
//               as: "paymentSale",
//               in: {
//                 type: "$$paymentSale._id.paymentMethod",
//                 amount: "$$paymentSale.amount"
//               }
//             }
//           },
//           categoryWiseSales: {
//             $map: {
//               input: {
//                 $filter: {
//                   input: "$monthlySales",
//                   as: "sale",
//                   cond: { $ne: ["$$sale._id.category", null] }
//                 }
//               },
//               as: "categorySale",
//               in: {
//                 category: "$$categorySale._id.category",
//                 amount: "$$categorySale.amount"
//               }
//             }
//           },
//           costOfGoodsSold: { $first: "$mainCalculations.costOfGoodsSold" },
//           discounts: {
//             offerDiscount: {
//               $subtract: [
//                 { $first: "$mainCalculations.mrpTotal" },
//                 { $first: "$mainCalculations.offerTotal" }
//               ]
//             },
//             regularDiscount: { $first: "$mainCalculations.regularDiscount" },
//             couponDiscount: { $first: "$mainCalculations.couponDiscount" },
//             total: {
//               $add: [
//                 {
//                   $subtract: [
//                     { $first: "$mainCalculations.mrpTotal" },
//                     { $first: "$mainCalculations.offerTotal" }
//                   ]
//                 },
//                 { $first: "$mainCalculations.regularDiscount" },
//                 { $first: "$mainCalculations.couponDiscount" }
//               ]
//             }
//           },
//           grossProfit: {
//             $subtract: [
//               { $first: "$mainCalculations.grossSales" },
//               { $first: "$mainCalculations.costOfGoodsSold" }
//             ]
//           },
//           netSales: {
//             withCost: { $first: "$mainCalculations.grossSales" },
//             withoutCost: {
//               $subtract: [
//                 { $first: "$mainCalculations.grossSales" },
//                 { $first: "$mainCalculations.costOfGoodsSold" }
//               ]
//             }
//           },
//           returns: { $first: "$mainCalculations.totalReturns" },
//           shipping: { $first: "$mainCalculations.shippingTotal" },
//           totalSales: { $first: "$mainCalculations.grossSales" },
//           productDetails: { $first: "$mainCalculations.productDetails" }
//         }
//       }
//     ]);

//     const reportData = report.length > 0 ? report[0] : {
//       summary: {
//         totalOrders: 0,
//         grossSales: 0,
//         mrpTotal: 0,
//         offerTotal: 0,
//         netSales: 0,
//         totalReturns: 0
//       },
//       grossPaymentsByMonth: [],
//       paymentsByType: [],
//       categoryWiseSales: [],
//       costOfGoodsSold: 0,
//       discounts: {
//         offerDiscount: 0,
//         regularDiscount: 0,
//         couponDiscount: 0,
//         total: 0
//       },
//       grossProfit: 0,
//       netSales: {
//         withCost: 0,
//         withoutCost: 0
//       },
//       returns: 0,
//       shipping: 0,
//       totalSales: 0,
//       productDetails: []
//     };

//     // Prepare flattened data for CSV
//     const flattenedData = {
//       "Total Orders": reportData.summary.totalOrders,
//       "Cost of Goods Sold": reportData.costOfGoodsSold,
//       "Offer Discounts": reportData.discounts.offerDiscount,
//       "Regular Discounts": reportData.discounts.regularDiscount,
//       "Coupon Discounts": reportData.discounts.couponDiscount,
//       "Total Discounts": reportData.discounts.total,
//       "Total MRP Value": reportData.summary.mrpTotal,
//       "Total Offer Value": reportData.summary.offerTotal,
//       "Gross Profit": reportData.grossProfit,
//       "Net Sales with Cost": reportData.netSales.withCost,
//       "Net Sales without Cost": reportData.netSales.withoutCost,
//       "Returns": reportData.returns,
//       "Shipping": reportData.shipping,
//       "Total Sales": reportData.totalSales
//     };

//     const csvFilePath = `${Date.now()}_financeReport.csv`;

//     const csvWriter = createCsvWriter({
//       path: csvFilePath,
//       header: [
//         { id: "Total Orders", title: "Total Orders" },
//         { id: "Cost of Goods Sold", title: "Cost of Goods Sold" },
//         { id: "Offer Discounts", title: "Offer Discounts" },
//         { id: "Regular Discounts", title: "Regular Discounts" },
//         { id: "Coupon Discounts", title: "Coupon Discounts" },
//         { id: "Total Discounts", title: "Total Discounts" },
//         { id: "Total MRP Value", title: "Total MRP Value" },
//         { id: "Total Offer Value", title: "Total Offer Value" },
//         { id: "Gross Profit", title: "Gross Profit" },
//         { id: "Net Sales with Cost", title: "Net Sales with Cost" },
//         { id: "Net Sales without Cost", title: "Net Sales without Cost" },
//         { id: "Returns", title: "Returns" },
//         { id: "Shipping", title: "Shipping" },
//         { id: "Total Sales", title: "Total Sales" }
//       ]
//     });

//     await csvWriter.writeRecords([flattenedData]);

//     const fileStream = fs.createReadStream(csvFilePath);
//     const uploadParams = {
//       Bucket: process.env.AWS_S3BUCKET_NAME,
//       Key: `reports/${csvFilePath}`,
//       Body: fileStream,
//       ContentType: "text/csv"
//     };

//     try {
//       const data = await s3.upload(uploadParams).promise();
//       const fileUrl = data.Location;

//       const subject = "Finance Report CSV export download link";
//       const content = `<a href="${fileUrl}" target="_blank">Download</a>`;

//       await sendMail(res.locals.user.email, subject, "", content);
//     } catch (error) {
//       console.log("Error in file upload or email sending:", error);
//     }

//     return helper.deliverResponse(res, 200, {
//       data: reportData,
//       error_code: messages.successResponse.error_code,
//       message: 'Finance report generated and uploaded successfully'
//     });

//   } catch (error) {
//     res.status(500).json({
//       error_code: 1,
//       message: 'Error generating finance report',
//       error: error.message
//     });
//   }
// };
exports.financeReport = async (req, res) => {
  try {
    const report = await db.Order.aggregate([
      {
        $match: {
          orderStatus: { $ne: "CANCELLED" } // Exclude cancelled orders from calculations
        }
      },
      {
        $unwind: "$products"
      },
      {
        $lookup: {
          from: "products",
          localField: "products.productId",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      {
        $addFields: {
          "productInfo": { $arrayElemAt: ["$productDetails", 0] }
        }
      },
      {
        $group: {
          _id: null,
          // Get all orders first to calculate total properly
          orders: { $push: "$$ROOT" },
          // Calculate raw gross sales based on product totals
          rawGrossSales: { 
            $sum: { 
              $convert: { 
                input: "$products.total", 
                to: "double", 
                onError: 0, 
                onNull: 0 
              } 
            } 
          }
        }
      },
      {
        $unwind: "$orders"
      },
      {
        $replaceRoot: { newRoot: { $mergeObjects: ["$orders", { rawGrossSales: "$rawGrossSales" }] } }
      },
      {
        $facet: {
          "monthlySales": [
            {
              $group: {
                _id: { 
                  month: { $month: "$createdAt" },
                  paymentMethod: "$paymentMethod",
                  category: "$productInfo.category"
                },
                amount: { $sum: { $convert: { input: "$products.total", to: "double", onError: 0, onNull: 0 } } },
                count: { $sum: 1 } 
              }
            }
          ],
          "mainCalculations": [
            {
              $group: {
                _id: null,
                totalOrders: { 
                  $addToSet: "$orderId" // Count unique orders 
                },
                grossSales: { $first: "$rawGrossSales" }, // Use the pre-calculated gross sales
                mrpTotal: {
                  $sum: {
                    $multiply: [
                      { $convert: { input: "$products.quantity", to: "double", onError: 0, onNull: 0 } },
                      { $convert: { input: "$productInfo.price.mrp", to: "double", onError: 0, onNull: 0 } }
                    ]
                  }
                },
                offerTotal: {
                  $sum: {
                    $multiply: [
                      { $convert: { input: "$products.quantity", to: "double", onError: 0, onNull: 0 } },
                      { $convert: { input: "$productInfo.price.offer", to: "double", onError: 0, onNull: 0 } }
                    ]
                  }
                },
                costOfGoodsSold: {
                  $sum: {
                    $multiply: [
                      { $convert: { input: "$products.quantity", to: "double", onError: 0, onNull: 0 } },
                      { $convert: { input: "$productInfo.price.production", to: "double", onError: 0, onNull: 0 } }
                    ]
                  }
                },
                regularDiscount: { $sum: { $convert: { input: "$discount", to: "double", onError: 0, onNull: 0 } } },
                couponDiscount: { $sum: { $convert: { input: "$couponDiscount", to: "double", onError: 0, onNull: 0 } } },
                totalReturns: {
                  $sum: {
                    $cond: [
                      { $eq: ["$orderStatus", "RETURNED"] },
                      { $convert: { input: "$products.total", to: "double", onError: 0, onNull: 0 } },
                      0
                    ]
                  }
                },
                shippingTotal: { $sum: { $convert: { input: "$additionalCharge", to: "double", onError: 0, onNull: 0 } } }
              }
            },
            {
              $addFields: {
                totalOrders: { $size: "$totalOrders" } // Convert array of unique orders to count
              }
            }
          ]
        }
      },
      {
        $project: {
          summary: {
            totalOrders: { $ifNull: [{ $arrayElemAt: ["$mainCalculations.totalOrders", 0] }, 0] },
            grossSales: { $ifNull: [{ $arrayElemAt: ["$mainCalculations.grossSales", 0] }, 0] },
            mrpTotal: { $ifNull: [{ $arrayElemAt: ["$mainCalculations.mrpTotal", 0] }, 0] },
            offerTotal: { $ifNull: [{ $arrayElemAt: ["$mainCalculations.offerTotal", 0] }, 0] },
            netSales: {
              $ifNull: [
                {
                  $subtract: [
                    { $ifNull: [{ $arrayElemAt: ["$mainCalculations.grossSales", 0] }, 0] },
                    { $ifNull: [{ $arrayElemAt: ["$mainCalculations.totalReturns", 0] }, 0] }
                  ]
                },
                0
              ]
            },
            totalReturns: { $ifNull: [{ $arrayElemAt: ["$mainCalculations.totalReturns", 0] }, 0] }
          },
          grossPaymentsByMonth: "$monthlySales",
          paymentsByType: {
            $filter: {
              input: "$monthlySales",
              as: "sale",
              cond: { $ne: ["$$sale._id.paymentMethod", null] }
            }
          },
          paymentTransactions: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: "$monthlySales",
                    as: "sale",
                    cond: { $ne: ["$$sale._id.paymentMethod", null] }
                  }
                },
                as: "paymentSale",
                in: "$$paymentSale.count"
              }
            }
          },
          categoryWiseSales: {
            $filter: {
              input: "$monthlySales",
              as: "sale",
              cond: { $ne: ["$$sale._id.category", null] }
            }
          },
          costOfGoodsSold: { $ifNull: [{ $arrayElemAt: ["$mainCalculations.costOfGoodsSold", 0] }, 0] },
          discounts: {
            offerDiscount: {
              $ifNull: [
                { 
                  $subtract: [
                    { $ifNull: [{ $arrayElemAt: ["$mainCalculations.mrpTotal", 0] }, 0] },
                    { $ifNull: [{ $arrayElemAt: ["$mainCalculations.offerTotal", 0] }, 0] }
                  ]
                }, 
                0
              ]
            },
            regularDiscount: { $ifNull: [{ $arrayElemAt: ["$mainCalculations.regularDiscount", 0] }, 0] },
            couponDiscount: { $ifNull: [{ $arrayElemAt: ["$mainCalculations.couponDiscount", 0] }, 0] },
            total: {
              $ifNull: [
                {
                  $add: [
                    {
                      $subtract: [
                        { $ifNull: [{ $arrayElemAt: ["$mainCalculations.mrpTotal", 0] }, 0] },
                        { $ifNull: [{ $arrayElemAt: ["$mainCalculations.offerTotal", 0] }, 0] }
                      ]
                    },
                    { $ifNull: [{ $arrayElemAt: ["$mainCalculations.regularDiscount", 0] }, 0] },
                    { $ifNull: [{ $arrayElemAt: ["$mainCalculations.couponDiscount", 0] }, 0] }
                  ]
                },
                0
              ]
            }
          },
          grossProfit: {
            $ifNull: [
              {
                $subtract: [
                  { $ifNull: [{ $arrayElemAt: ["$mainCalculations.grossSales", 0] }, 0] },
                  { $ifNull: [{ $arrayElemAt: ["$mainCalculations.costOfGoodsSold", 0] }, 0] }
                ]
              },
              0
            ]
          },
          netSales: {
            withCost: { $ifNull: [{ $arrayElemAt: ["$mainCalculations.grossSales", 0] }, 0] },
            withoutCost: {
              $ifNull: [
                {
                  $subtract: [
                    { $ifNull: [{ $arrayElemAt: ["$mainCalculations.grossSales", 0] }, 0] },
                    { $ifNull: [{ $arrayElemAt: ["$mainCalculations.costOfGoodsSold", 0] }, 0] }
                  ]
                },
                0
              ]
            }
          },
          returns: { $ifNull: [{ $arrayElemAt: ["$mainCalculations.totalReturns", 0] }, 0] },
          shipping: { $ifNull: [{ $arrayElemAt: ["$mainCalculations.shippingTotal", 0] }, 0] },
          totalSales: { $ifNull: [{ $arrayElemAt: ["$mainCalculations.grossSales", 0] }, 0] },
          grossSales: { $ifNull: [{ $arrayElemAt: ["$mainCalculations.grossSales", 0] }, 0] }
        }
      }
    ]);

    // Log raw data for troubleshooting
    console.log("Raw report data:", JSON.stringify(report, null, 2));

    let reportData = report.length > 0 ? report[0] : {
      summary: {
        totalOrders: 0,
        grossSales: 0,
        mrpTotal: 0,
        offerTotal: 0,
        netSales: 0,
        totalReturns: 0
      },
      grossPaymentsByMonth: [],
      paymentsByType: [],
      paymentTransactions: 0,
      categoryWiseSales: [],
      costOfGoodsSold: 0,
      discounts: {
        offerDiscount: 0,
        regularDiscount: 0,
        couponDiscount: 0,
        total: 0
      },
      grossProfit: 0,
      netSales: {
        withCost: 0,
        withoutCost: 0
      },
      returns: 0,
      shipping: 0,
      totalSales: 0,
      grossSales: 0
    };

    // Function to only correct NaN values, not all numeric values
    const correctNaNValues = (obj) => {
      if (obj === null || obj === undefined) {
        return obj;
      }
      
      if (typeof obj === 'number' && isNaN(obj)) {
        return 0; // Only replace NaN values
      }
      
      if (typeof obj !== 'object') {
        return obj; // Return as is if not an object or array
      }
      
      // Handle arrays
      if (Array.isArray(obj)) {
        return obj.map(item => correctNaNValues(item));
      }
      
      // Handle objects recursively
      const result = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          result[key] = correctNaNValues(obj[key]);
        }
      }
      return result;
    };

    // Apply NaN correction - this only changes actual NaN values to 0
    reportData = correctNaNValues(reportData);
    
    // Process payment types data for cleaner output
    if (reportData.paymentsByType && Array.isArray(reportData.paymentsByType)) {
      reportData.paymentsByType = reportData.paymentsByType.map(payment => {
        if (payment && payment._id) {
          return {
            type: payment._id.paymentMethod,
            amount: payment.amount || 0,
            count: payment.count || 0
          };
        }
        return payment;
      });
    }
    
    // Process category data for cleaner output
    if (reportData.categoryWiseSales && Array.isArray(reportData.categoryWiseSales)) {
      reportData.categoryWiseSales = reportData.categoryWiseSales.map(category => {
        if (category && category._id) {
          return {
            category: category._id.category,
            amount: category.amount || 0
          };
        }
        return category;
      });
    }
    
    // Process payments by month data
    if (reportData.grossPaymentsByMonth && Array.isArray(reportData.grossPaymentsByMonth)) {
      reportData.grossPaymentsByMonth = reportData.grossPaymentsByMonth
        .filter(item => item && item._id && item._id.month)
        .map(monthSale => ({
          month: monthSale._id.month,
          amount: monthSale.amount || 0
        }));
    }
    
    // Ensure grossSales is properly set from the summary
    if (reportData.summary && reportData.summary.grossSales) {
      reportData.grossSales = reportData.summary.grossSales;
      reportData.totalSales = reportData.summary.grossSales;
    }
    
    // Ensure other values are properly derived
    if (reportData.grossSales && reportData.costOfGoodsSold) {
      reportData.grossProfit = reportData.grossSales - reportData.costOfGoodsSold;
      reportData.netSales.withCost = reportData.grossSales;
      reportData.netSales.withoutCost = reportData.grossProfit;
    }
    
    // Log processed data for verification
    console.log("Processed report data:", reportData);

    // Extract payment method breakdown
    const paymentBreakdown = {};
    if (reportData.paymentsByType && Array.isArray(reportData.paymentsByType)) {
      reportData.paymentsByType.forEach(payment => {
        if (payment && payment.type) {
          paymentBreakdown[`Payment - ${payment.type}`] = payment.amount || 0;
          paymentBreakdown[`Transactions - ${payment.type}`] = payment.count || 0;
        }
      });
    }

    // Prepare flattened data for CSV - ensure all values are valid numbers
    const flattenedData = {
      "Total Orders": reportData.summary.totalOrders || 0,
      "Gross Sales": reportData.grossSales || 0,
      "Cost of Goods Sold": reportData.costOfGoodsSold || 0,
      "Net Sales with Cost": reportData.netSales?.withCost || 0,
      "Net Sales without Cost": reportData.netSales?.withoutCost || 0,
      "Offer Discounts": reportData.discounts?.offerDiscount || 0,
      "Regular Discounts": reportData.discounts?.regularDiscount || 0,
      "Coupon Discounts": reportData.discounts?.couponDiscount || 0,
      "Total Discounts": reportData.discounts?.total || 0,
      "Total Payment Transactions": reportData.paymentTransactions || 0,
      "Shipping Costs": reportData.shipping || 0,
      "Total MRP Value": reportData.summary.mrpTotal || 0,
      "Total Offer Value": reportData.summary.offerTotal || 0,
      "Gross Profit": reportData.grossProfit || 0,
      "Returns": reportData.returns || 0,
      "Total Sales": reportData.totalSales || 0,
      ...paymentBreakdown
    };

    // Create a dynamic header list based on all properties in flattenedData
    const headerList = Object.keys(flattenedData).map(key => ({
      id: key,
      title: key
    }));

    const csvFilePath = `${Date.now()}_financeReport.csv`;

    const csvWriter = createCsvWriter({
      path: csvFilePath,
      header: headerList
    });

    await csvWriter.writeRecords([flattenedData]);

    const fileStream = fs.createReadStream(csvFilePath);
    const uploadParams = {
      Bucket: process.env.AWS_S3BUCKET_NAME,
      Key: `reports/${csvFilePath}`,
      Body: fileStream,
      ContentType: "text/csv"
    };

    try {
      const data = await s3.upload(uploadParams).promise();
      const fileUrl = data.Location;

      const subject = "Finance Report CSV export download link";
      const content = `<a href="${fileUrl}" target="_blank">Download</a>`;
  
      await sendMail(res.locals.user.email, subject, "", content);
    } catch (error) {
      console.log("Error in file upload or email sending:", error);
    }

    return helper.deliverResponse(res, 200, {
      data: reportData,
      error_code: messages.successResponse.error_code,
      message: 'Finance report generated and uploaded successfully'
    });

  } catch (error) {
    console.log("Error in finance report generation:", error);
    res.status(500).json({
      error_code: 1,
      message: 'Error generating finance report',
      error: error.message
    });
  }
};
exports.updateOrder = async (req, res) => {
    try {
        let { body } = req;
        const orderResponse = await service.updateOrder(body?.order, body);
        if (orderResponse instanceof Error) {
            helper.deliverResponse(res, 422, orderResponse, {
                error_code: messages.serverError.error_code,
                error_message: messages.serverError.error_message,
            });
        } else {
            helper.deliverResponse(res, 200, orderResponse, {
                error_code: messages.ORDER_UPDATED.error_code,
                error_message: messages.ORDER_UPDATED.error_message,
            });
        }
    } catch (error) {
        console.log('Error caught in update order API :: ' + error);
        helper.deliverResponse(res, 422, {}, {
            error_code: messages.serverError.error_code,
            error_message: messages.serverError.error_message,
        });
    }
};
exports.updateOrderStatusFromProductHistory = async (req, res) => {
  try {
    const { order } = req.body;

    if (!order) {
      return res.status(400).json({ message: "Order number is required." });
    }

    const foundOrder = await db.Order.findOne({ orderNo: order });

    if(foundOrder.orderStatus === "PENDING"){
      return res.status(400).json({ message: "Order is Pending." });
    }

    if (!foundOrder) {
      return res.status(404).json({ message: "Order not found." });
    }

    if (!foundOrder.products || foundOrder.products.length === 0) {
      return res.status(400).json({ message: "No products found in order." });
    }

    const latestStatuses = foundOrder.products.map(product => {
      const history = product.history;
      if (!history || history.length === 0) return null;
      return history[history.length - 1].status;
    });

    const filteredStatuses = latestStatuses.filter(status => status !== null);

    if (filteredStatuses.length === 0) {
      return res.status(400).json({ message: "No valid product statuses found." });
    }

    const allSame = filteredStatuses.every(status => status === filteredStatuses[0]);
    const newOrderStatus = allSame ? filteredStatuses[0] : 'PARTIAL PROCESSED';

    if (foundOrder.orderStatus !== newOrderStatus) {
      foundOrder.orderStatus = newOrderStatus;
      await foundOrder.save();
      return res.status(200).json({ message: `Order status updated to: ${newOrderStatus}` });
    }

    return res.status(200).json({ message: "Order status already up to date." });
  } catch (error) {
    console.error("Error updating order status:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};
exports.getOrderShippingNumber = async (req, res) => {
  try {
    console.log("req.body",req.body)
    const orderShippingNumber = await service.getOrderShippingNumber(req?.body?.orderNumbers)
    console.log("orderShippingNumber",orderShippingNumber)
    return res.status(200).json({ message: "Order shipping number fetched successfully", orderShippingNumber });
  } catch (error) {
    console.error("Error fetching order shipping number:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
}