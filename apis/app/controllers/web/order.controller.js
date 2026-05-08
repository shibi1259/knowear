const helper = require("../../../util/responseHelper");
const messages = require("../../../config/constants").messages;
const service = require("../../services/order.service");
const guestService = require("../../services/guest.customer.service");
const customerService = require("../../services/customer.service");
const cartService = require("../../services/cart.service");
const productService = require("../../services/product.service");
const { body, validationResult } = require("express-validator");
const settingsService = require("../../services/general.settings.service");
const priceCheck = require("../../../util/priceCheck");
const { BASE_URL } = require("../../../config/constants/common");
const addressService = require("../../services/address.service");
const { getCartSummary } = require("../../../util/getCartSummary");
const guestCustomerService = require("../../services/guest.customer.service");
const activity = require("../../../util/activity.creator");
const { getDeliveryDate } = require("../../../util/getDeliveryDate");
const templates = require("../../../util/templates");
const mailer = require("../../../util/sendMail");
const shippingNoteService = require("../../services/shippingnote.service");
const {
  processNetworkInternationalPayment,
} = require("../../../util/payment-gateways/network-international.payment");
const {
  retrieveNetworkInternationalOrderStatus,
} = require("../../../util/payment-verifications/network-international");
const helpService = require("../../services/help.center.service");
exports.validate = (method) => {
  switch (method) {
    case "order-list": {
      return [
        body("status", "Status is required").exists(),
        body("page", "Page is required").exists(),
        body("limit", "Limit is required").exists(),
      ];
    }
    case "order-details": {
      return [body("order", "Order Id is required").exists()];
    }
    case "order-summary": {
      return [body("cart", "Cart id is required").exists()];
    }
    case "cart-body": {
      return [body("cart", "Cart id is required").exists()];
    }
    case "verify-payment": {
      return [body("order", "Order is required").exists()];
    }
  }
};

exports.getOrders = async (req, res, next) => {
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
    const { userid } = res?.locals?.user;
    const customer = await customerService.getCustomer({
      userid: userid,
      isActive: true,
      isDelete: false,
    });
    let data = { isDelete: false, customerId: customer?._id };

    switch (body.status) {
      case "active":
        data.orderStatus = {
          $in: [
            "PENDING",
            "PLACED",
            "ACCEPTED",
            "PACKED",
            "SHIPPED",
            "OUT FOR DELIVERY",
            "PARTIAL PROCESSED",
          ],
        };
        break;
      case "cancelled":
        data.orderStatus = {
          $in: ["CANCELLED", "FAILED"],
        };
        break;
      case "completed":
        data.orderStatus = { $in: ["DELIVERED", "COLLECTED"] };
        break;
      default:
        data.orderStatus = "PENDING";
        break;
    }
    const orders = await service.getOrdersForWeb(data, body?.page, body?.limit);
    helper.deliverResponse(res, 200, orders, {
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

exports.getOrderSummary = async (req, res, next) => {
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
    const { userid } = res?.locals?.user;
    const customerDetails = await customerService.getCustomer({
      userid: userid,
      isActive: true,
      isDelete: false,
    });
    const cartDetails = await cartService.getCart({
      refid: body?.cart,
      "customer.id": customerDetails?._id,
      isActive: true,
      isDelete: false,
    });
    console.log(cartDetails, "cartDetails");
    let addressProjection = {
      __v: 0,
      updatedAt: 0,
      _id: 0,
      createdAt: 0,
      isDelete: 0,
      isActive: 0,
      isDefault: 0,
      customer: 0,
      isArchive: 0,
    };
    const addressDetails = await addressService.findOne(
      {
        customer: customerDetails?._id,
        isDefault: true,
        isDelete: false,
        isActive: true,
      },
      addressProjection
    );
    const settings = await settingsService.findOne({});
    let products = [];
    let summary = {};

    let response = {
      selection: customerDetails?.defaultSelection,
      address: addressDetails,
      products: products,
      summary: summary,
    };

    for (let product of cartDetails?.products) {
      const productDetails = await productService.getSingleProduct({
        _id: product?.product,
        isActive: true,
        isDelete: false,
        isArchive: false,
      });
      if (productDetails) {
        let prices = [],
          cats = [],
          cols = [];
        let isFavourite = false;
        if (customerDetails?.wishlist?.includes(productDetails?._id))
          isFavourite = true;
        const sellingprice = productDetails?.price?.offer;
        prices.push(sellingprice);
        cats.push(...productDetails.category.id);
        for (let _cat of productDetails?.product?.id?.parentCategory?.id)
          if (!cats.includes(_cat?._id)) cats.push(_cat?._id);
        const leastamount = await priceCheck.productPriceCheck(
          productDetails?._id,
          productDetails?.name,
          cats,
          cols,
          prices,
          sellingprice
        );
        products.push({
          thumbnail: BASE_URL + productDetails?.thumbnail,
          params: {
            prodid: productDetails?.prodid,
            slug: productDetails?.slug,
          },
          name: {
            text: productDetails?.name,
            color: productDetails?.style?.text?.color,
          },
          price: {
            text: settings?.currency + " " + String(leastamount),
            color: productDetails?.style?.text?.color,
          },
          actual_price: {
            text: settings?.currency + " " + String(productDetails?.price?.mrp),
            color: productDetails?.style?.text?.color,
          },
          quantity: {
            text: product?.quantity,
          },
          isFavourite: {
            text: isFavourite,
          },
        });
      }
    }

    response.params = { refid: cartDetails?.refid };
    summary.subtotal = {
      text: settings?.currency + " " + cartDetails?.baseTotal,
    };
    summary.tax = { text: settings?.currency + " " + cartDetails?.taxTotal };
    summary.discount = {
      text: cartDetails?.discountTotal
        ? settings?.currency + " " + cartDetails?.discountTotal
        : null,
    };
    summary.total = { text: settings?.currency + " " + cartDetails?.total };
    helper.deliverResponse(res, 200, response, {
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

exports.getOrderDetails = async (req, res, next) => {
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

    const orderDetails = await service.getOrderDetailsForWeb({
      orderNo: body?.order,
    });
    console.log(orderDetails, "body for the order");
    let customerId = orderDetails?.customerId?.userid;
    let customerTye = orderDetails?.customerType;

    let guestId = orderDetails?.guestId?._id;
    console.log(customerTye, "customertqype  for the order");

    let allowPermission = true;
    // if (customerId && res?.locals?.user?.userid == customerId) {
    //     allowPermission = true;
    // }

    // if (guestId && !customerId && customerType == "guest"  ) {
    //     allowPermission = true;
    // }
    // if (customerTye == "regd") {
    // allowPermission = true;
    // }

    if (allowPermission) {
      helper.deliverResponse(res, 200, orderDetails, {
        error_code: messages.successResponse.error_code,
        error_message: messages.successResponse.error_message,
      });
    } else {
      helper.deliverResponse(
        res,
        403,
        {},
        {
          error_code: messages.NO_PERMISSION.error_code,
          error_message: messages.NO_PERMISSION.error_message,
        }
      );
    }
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

// exports.placeOrder = async (req, res) => {
//     try {
//         let { body } = req;

//         let paymentResponse = {};
//         const settings = await settingsService.findOne({})
//         const cartDetails = await cartService.getCart({ _id: body?.cart })
//         let customerDetails = {};
//         let guestDetails = {}
//         let addressDetails = {}
//         let data = { cart: cartDetails?._id }
//         if (res?.locals?.user?.userid) {
//             // Incase of registered user, customer details will be fetched from customer collection
//             customerDetails = await customerService.getCustomer({ userid: res?.locals?.user?.userid, isActive: true, isDelete: false })
//             addressDetails = await addressService.findOne({ customer: customerDetails?._id, isDefaultShipping: true, isDelete: false }, {})
//             data["customerId"] = customerDetails?._id;
//             data['customerType'] = "regd"
//         }
//         if (body.guest) {
//             // Incase of guest user, guest details will be fetched from guest customer collection
//             guestDetails = await guestCustomerService.findOne({ token: body.guest });
//             data['guestId'] = guestDetails?._id
//             data['customerType'] = "guest"
//         }

//         if (body?.address) {
//             // If user has selected address
//             const shippingAddress = await addressService.findOne({ _id: body.address })
//             data['address'] = shippingAddress;
//         } else if (body?.guestAddress) {
//             // If user has entered address
//             data['address'] = body.guestAddress
//         } else {
//             // If user has not selected address or entered address then default address will be used
//             data['address'] = addressDetails
//         }

//         const orderCounts = await service.getOrderCounts({})
//         data['orderNo'] = `#${orderCounts + 1000}`
//         data['shippingnotes'] = cartDetails?.shippingnote?.note
//         if (cartDetails?.coupon) data['coupon'] = cartDetails?.coupon?._id
//         data['invoiceNo'] = `INV${orderCounts + 1000}`
//         data['paymentMethod'] = body?.paymentMethod
//         let cartResponse = await getCartSummary(cartDetails, productService, settings, "checkout")

//         //Cart summary calculation ends here
//         data.orderDate = new Date()
//         data.products = cartResponse?.products || [];
//         data.total = Number(cartResponse?.cartTotal.toFixed(2))
//         data.discount = Number(cartResponse?.cartDiscountTotal.toFixed(2));
//         data.subtotal = Number(cartResponse?.cartSubTotal.toFixed(2));
//         data.tax = Number(cartResponse?.cartTaxTotal.toFixed(2));
//         data.wholeTotal = Number(cartResponse?.cartWholeTotal.toFixed(2))
//         data.shippingCharge= Number(cartResponse?.shipingChargeTotal.toFixed(2))
//         data.giftWrapTotal = Number(cartResponse?.cartGiftWrapTotal.toFixed(2))
//         if (body.paymentMethod == 'COD') {
//             data.orderStatus = "PLACED"
//         }
//         let response;
//         if (body.paymentMethod == 'COD') {
//             response = await service.createOrder(data)
//             console.log(response, "response");
//             //Stock updation
//             for (let product of cartDetails?.products) {
//                 const productDetails = await productService.getSingleProduct({ _id: product.product?._id, isActive: true, isDelete: false })
//                 if (productDetails) {
//                     let stock = productDetails?.stock - Number(product?.quantity)
//                     await productService.updateProduct(productDetails?._id, { stock: stock })
//                 }
//             }
//             //Stock updation

//             //Cart updation
//             await cartService.updateCart({ _id: body?.cart }, {
//                 isPurchased: true,
//                 date: { purchased: new Date().toISOString() }
//             })

//             //Order placed email notification\
//             let products = []
//             for (let product of response?.products) {
//                 const productDetails = await productService.getSingleProduct({ _id: product?.productId, isActive: true, isDelete: false })
//                 if (productDetails) {
//                     products.push({
//                         thumbnail: BASE_URL + productDetails?.thumbnail,
//                         title: productDetails?.name,
//                         quantity: product?.quantity,
//                         price: settings?.currency + " " + product?.pricePerUnit,
//                         total: settings?.currency + " " + product?.total
//                     })
//                 }
//             }
//             const subject = `Your order ${response?.orderNo} has been placed!`
//             const content = `We're pleased to confirm your order no ${response?.orderNo}. Thank you for shopping with ${settings?.name}`
//             const orderDetails = {
//                 store: settings?.name,
//                 branding: BASE_URL + settings?.logo,
//                 total: settings?.currency + " " + data.wholeTotal,
//                 grandtotal: settings?.currency + " " + response.total,
//                 primaryColor: "#000000",
//                 secondaryColor: "#F3F5F7",
//                 name: customerDetails?.name,
//                 products: products,
//                 paymentMethod: response?.paymentMethod,
//                 date: new Date(response?.createdAt).toDateString(),
//                 order: response?.orderNo,
//                 subtotal: settings?.currency + " " + response.subtotal,
//                 paymentMethod: response?.paymentMethod,
//                 additionalCharge: response?.additionalCharge,
//                 tax: response?.tax,
//                 giftWrapTotal: response?.giftWrapTotal,
//                 address: {
//                     lane: response?.address?.aptSuiteUnit ? response?.address?.streetAddress + ", " + response?.address?.aptSuiteUnit : response?.address?.streetAddress,
//                     city: response?.address?.city,
//                     state: response?.address?.state,
//                 }
//             }
//             const placedTemplate = templates.orderPlaced(orderDetails)
//             await mailer.sendMail(customerDetails?.email, subject, content, placedTemplate)
//             // const mailers = await mailerService.findOne({ refid: '1' })
//         }

//         else if (body.paymentMethod === "network-international") {

//             data.paymentGateWay = "network-international";

//             const responseFromNetWorkInterNational =
//                 await processNetworkInternationalPayment(
//                     data,
//                     customerDetails,
//                     guestDetails
//                 );

//             response = await service.createOrder(data)
//             //   redirectionUrl = responseFromNetWorkInterNational?.paymentDetails?.merchantAttributes?.redirectUrl;
//             //  console.log(responseFromNetWorkInterNational?.paymentDetails?.merchantAttributes?.redirectUrl,"responseFromNetWorkInterNational");
//             if (responseFromNetWorkInterNational?.paymentError) {
//                 helper.deliverResponse(res, 400, "", {
//                     error_code: 1,
//                     error_message:
//                         "unable proceed with this payment method right now, please try again with another payment method",
//                 });
//                 return;
//             } else {
//                 paymentResponse = responseFromNetWorkInterNational?.paymentResponse || {};
//             }
//         }

//         if (response instanceof Error) {
//             helper.deliverResponse(res, 422, {}, {
//                 "error_code": messages.UNABLE_TO_PLACE_ORDER.error_code,
//                 "error_message": messages.UNABLE_TO_PLACE_ORDER.error_message
//             });
//             return;
//         } else {
//             helper.deliverResponse(res, 200, {
//                 orderNo: response?.orderNo,
//                 ...paymentResponse,  // Added redirection URL here
//             }, {
//                 "error_code": messages.successResponse.error_code,
//                 "error_message": messages.successResponse.error_message
//             });
//         }
//     } catch (error) {

//         helper.deliverResponse(res, 422, error, {
//             "error_code": messages.serverError.error_code,
//             "error_message": messages.serverError.error_message
//         });
//     }
// }
exports.placeOrder = async (req, res) => {
  try {
    let { body } = req;

    let paymentResponse = {};
    const settings = await settingsService.findOne({});
    let customerDetails = {};
    let guestDetails = {};
    let addressDetails = {};
    let data = {};

    if (res?.locals?.user?.userid) {
      customerDetails = await customerService.getCustomer({
        userid: res?.locals?.user?.userid,
        isActive: true,
        isDelete: false,
      });
      addressDetails = await addressService.findOne(
        {
          customer: customerDetails?._id,
          isDefaultShipping: true,
          isDelete: false,
        },
        {}
      );
      data["customerId"] = customerDetails?._id;
      data["customerType"] = "regd";
    }

    if (body.guest) {
      guestDetails = await guestCustomerService.findOne({ token: body.guest });
      data["guestId"] = guestDetails?._id;
      data["customerType"] = "guest";
    }

    if (body?.address) {
      const shippingAddress = await addressService.findOne({
        _id: body.address,
      });
      data["address"] = shippingAddress;
    } else if (body?.guestAddress) {
      data["address"] = body.guestAddress;
    } else {
      data["address"] = addressDetails;
    }

    console.log(data["address"], "address here!!!");

    const orderCounts = await service.getOrderCounts({});
    data["orderNo"] = `#${orderCounts + 1000}`;
    data["invoiceNo"] = `INV${orderCounts + 1000}`;
    data["paymentMethod"] = body?.paymentMethod;
    data["orderDate"] = new Date();

    if (body.isBuyNow) {
      // **Buy Now Flow**
      if (!body.productDetails) {
        return helper.deliverResponse(
          res,
          400,
          {},
          {
            error_code: 1,
            error_message: "Product details are required for Buy Now",
          }
        );
      }

      data.products = [body.productDetails];
      data.total = Number(body.productDetails.total.toFixed(2));
      data.discount = Number(body.productDetails.discount?.toFixed(2) || 0);
      data.subtotal = Number(
        body.productDetails.subtotal?.toFixed(2) || data.total
      );
      data.tax = Number(body.productDetails.tax?.toFixed(2) || 0);
      data.wholeTotal = Number(
        body.productDetails.wholeTotal?.toFixed(2) || data.total
      );
      data.shippingCharge = Number(
        body.productDetails.shippingCharge?.toFixed(2) || 0
      );
      data.giftWrapTotal = Number(
        body.productDetails.giftWrapTotal?.toFixed(2) || 0
      );

      if (body?.cart) {
        await cartService.updateCart({ _id: body?.cart }, { giftWrap: null });
      }

      if (body?.deliverynote?._id && body?.deliverynote?._id !== "null") {
        await shippingNoteService.update(
          { _id: body?.deliverynote?._id },
          { isEnabled: false }
        );
      }
    } else {
      // **Cart-Based Flow**
      const cartDetails = await cartService.getCart({ _id: body?.cart });

      if (body?.cart) {
        await cartService.updateCart({ _id: body?.cart }, { giftWrap: null });
      }

      if (body?.deliverynote?._id && body?.deliverynote?._id !== "null") {
        await shippingNoteService.update(
          { _id: body?.deliverynote?._id },
          { isEnabled: false }
        );
      }

      console.log(cartDetails, "cartDetails");

      if (!cartDetails) {
        return helper.deliverResponse(
          res,
          400,
          {},
          {
            error_code: 1,
            error_message: "Cart not found",
          }
        );
      }

      data["cart"] = cartDetails?._id;
      data["shippingnotes"] = cartDetails?.shippingnote?.note;
      if (cartDetails?.coupon) data["coupon"] = cartDetails?.coupon?._id;
      let cartResponse = await getCartSummary(
        cartDetails,
        productService,
        settings,
        "checkout"
      );

      data.products = cartResponse?.products || [];
      data.total = Number(cartResponse?.cartTotal.toFixed(2));
      data.discount = Number(cartResponse?.cartDiscountTotal.toFixed(2));
      data.subtotal = Number(cartResponse?.cartSubTotal.toFixed(2));
      data.tax = Number(cartResponse?.cartTaxTotal.toFixed(2));
      data.wholeTotal = Number(cartResponse?.cartWholeTotal.toFixed(2));
      data.shippingCharge = Number(cartResponse?.shipingChargeTotal.toFixed(2));
      data.giftWrapTotal = Number(cartResponse?.cartGiftWrapTotal.toFixed(2));
    }

    if (body.paymentMethod === "COD") {
      data.orderStatus = "PLACED";
    }

    let response;
    // console.log(data);
    if (body.paymentMethod === "COD") {
      response = await service.createOrder(data);

      // **Stock Update**
      for (let product of data.products) {
        const productDetails = await productService.getSingleProduct({
          _id: product.productId,
          isActive: true,
          isDelete: false,
        });
        if (productDetails) {
          let stock = productDetails?.stock - Number(product?.quantity);
          await productService.updateProduct(productDetails?._id, {
            stock: stock,
          });
        }
      }

      // **Cart Update**
      if (!body.isBuyNow) {
        await cartService.updateCart(
          { _id: body?.cart },
          {
            isPurchased: true,
            date: { purchased: new Date().toISOString() },
          }
        );
      }

      // **Order Confirmation Email**
      let products = [];
      for (let product of response?.products) {
        const productDetails = await productService.getSingleProduct({
          _id: product?.productId,
          isActive: true,
          isDelete: false,
        });
        if (productDetails) {
          products.push({
            thumbnail: BASE_URL + productDetails?.thumbnail,
            title: productDetails?.name,
            quantity: product?.quantity,
            price: settings?.currency + " " + product?.pricePerUnit,
            total: settings?.currency + " " + product?.total,
          });
        }
      }

      const subject = `Your order ${response?.orderNo} has been placed!`;
      const content = `We're pleased to confirm your order no ${response?.orderNo}. Thank you for shopping with ${settings?.name}`;

      const orderDetails = {
        store: settings?.name,
        branding: BASE_URL + settings?.logo,
        total: settings?.currency + " " + data.wholeTotal,
        grandtotal: settings?.currency + " " + response.total,
        primaryColor: "#000000",
        secondaryColor: "#F3F5F7",
        name: customerDetails?.name,
        products: products,
        paymentMethod: response?.paymentMethod,
        date: new Date(response?.createdAt).toDateString(),
        order: response?.orderNo,
        subtotal: settings?.currency + " " + response.subtotal,
        paymentMethod: response?.paymentMethod,
        additionalCharge: response?.additionalCharge,
        tax: response?.tax,
        giftWrapTotal: response?.giftWrapTotal,
        address: {
          lane: response?.address?.aptSuiteUnit
            ? response?.address?.streetAddress +
              ", " +
              response?.address?.aptSuiteUnit
            : response?.address?.streetAddress,
          city: response?.address?.city,
          state: response?.address?.state,
          deliveryAddress: response?.address?.deliveryInstruction,
        },
      };

      const placedTemplate = templates.orderPlaced(orderDetails);
      await mailer.sendMail(
        customerDetails?.email,
        subject,
        content,
        placedTemplate
      );

      
    } else if (body.paymentMethod === "network-international") {
      data.paymentGateWay = "network-international";
      const responseFromNetWorkInterNational =
        await processNetworkInternationalPayment(
          data,
          customerDetails,
          guestDetails
        );

      response = await service.createOrder(data);

      if (responseFromNetWorkInterNational?.paymentError) {
        return helper.deliverResponse(res, 400, "", {
          error_code: 1,
          error_message:
            "Unable to proceed with this payment method right now. Please try again with another payment method.",
        });
      } else {
        paymentResponse =
          responseFromNetWorkInterNational?.paymentResponse || {};
      }
    }

    if (response instanceof Error) {
      return helper.deliverResponse(
        res,
        422,
        {},
        {
          error_code: messages.UNABLE_TO_PLACE_ORDER.error_code,
          error_message: messages.UNABLE_TO_PLACE_ORDER.error_message,
        }
      );
    }

    return helper.deliverResponse(
      res,
      200,
      {
        orderNo: response?.orderNo,
        ...paymentResponse,
      },
      {
        error_code: messages.successResponse.error_code,
        error_message: messages.successResponse.error_message,
      }
    );
  } catch (error) {
    return helper.deliverResponse(res, 422, error, {
      error_code: messages.serverError.error_code,
      error_message: messages.serverError.error_message,
    });
  }
};

exports.codDetails = async (req, res) => {
  try {
    const { body } = req;
    const settings = await settingsService.findOne({});
    const cartDetails = await cartService.getCart({ refid: body?.cart });
    let products = [];
    let codCharges = [];
    for (let product of cartDetails?.products) {
      product?.product?.product?.id?.cod?.isPresent == true
        ? codCharges.push(product?.product?.product?.id?.cod?.value)
        : null;
      products.push({
        name: product?.product?.name,
        params: {
          slug: product?.product?.slug,
          prodid: product?.product?.prodid,
        },
        codAvailable: product?.product?.product?.id?.cod?.isPresent,
        codMessage:
          product?.product?.product?.id?.cod?.isPresent == false
            ? "Cash on Delivery(COD) is not available for this product"
            : null,
      });
    }
    let codCharge = codCharges.length > 0 ? Math.max(...codCharges) : 0;
    let message =
      codCharge > 0
        ? `There will be an additional charge of ${settings?.currency} ${codCharge} for Cash on Delivery (COD)`
        : "There won't be an additional charge for Cash on Delivery (COD)";
    helper.deliverResponse(
      res,
      200,
      {
        products: products,
        message: message,
        codCharge: settings?.currency + " " + codCharge,
      },
      {
        error_code: messages.successResponse.error_code,
        error_message: messages.successResponse.error_message,
      }
    );
  } catch (error) {
    console.log("Error caught in cod details web API :: ", error);
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

exports.repeatOrder = async (req, res) => {
  try {
    const { body } = req;
    const orderDetails = await service.getOrderDetails({
      orderNo: body?.order,
    });
    const isCartExists = await cartService.getCart({
      customer: orderDetails?.customerId?._id,
      isDelete: false,
    });
    if (isCartExists) {
      let products = isCartExists?.products;
      for (let product of orderDetails?.products) {
        addOrUpdateProduct(product, products);
      }
    } else {
      let payload = {
        customer: orderDetails?.customerId?._id,
        refid: (await cartService.getCartCount({})) + 1,
      };
      const products = await repeatedProducts(orderDetails?.products);
      payload = { ...payload, ...products };
      const response = await cartService.createCart(payload);
      if (response instanceof Error) {
        helper.deliverResponse(
          res,
          422,
          {},
          {
            error_code: messages.serverError.error_code,
            error_message: messages.serverError.error_message,
          }
        );
      } else {
        helper.deliverResponse(res, 200, response, {
          error_code: messages.successResponse.error_code,
          error_message: messages.successResponse.error_message,
        });
      }
    }
  } catch (error) {
    console.log("Error caught in repeat order web API :: ", error);
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

function addOrUpdateProduct(arrayAItem, arrayB) {
  const productIndex = arrayB.findIndex(
    (item) => item.product?._id === arrayAItem.productId?._id
  );
  if (productIndex === -1) {
    arrayB.push({
      product: arrayAItem.productId?._id,
      quantity: arrayAItem.quantity,
    });
  } else {
    arrayB[productIndex].quantity += arrayAItem.quantity;
  }
  return arrayB;
}

async function repeatedProducts(products) {
  let repeatedProducts = [];
  for (let product of products) {
    const productDetails = await productService.getProductDetails({
      _id: product?.productId?._id,
    });
    product?.productId?.stock > 0
      ? repeatedProducts.push({
          product: productDetails?._id,
          quantity:
            quantity < product?.productId?.stock
              ? quantity
              : quantity > product?.productId?.stock &&
                product?.productId?.stock > 0
              ? product?.productId?.stock
              : 1,
        })
      : null;
  }

  return { products: repeatedProducts };
}

exports.invoiceDetails = async (req, res) => {
  try {
    const { order } = req.params;
    const settings = await settingsService.findOne({});
    const orderDetails = await service.getOrderDetails({
      orderNo: "#" + order,
    });
    const helpDetails = await helpService.findOne();

    const guestDetails = await guestService.findGuestById(
      orderDetails?.guestId
    );
    console.log("guestDetails", guestDetails);
    if (!orderDetails) {
      helper.deliverResponse(
        res,
        422,
        {},
        {
          error_code: messages.serverError.error_code,
          error_message: messages.serverError.error_message,
        }
      );
    } else {
      res.render("invoice", {
        base: BASE_URL,
        settings,
        orderDetails,
        guestDetails,
        helpDetails,
        getDeliveryDate,
        store: {
          address: {
            firstlane: "",
            secondlane: "",
            area: "",
            city: "",
          },
        },
      });
    }
  } catch (_error) {
    console.log("Error caught in invoice details API :: " + _error);
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
exports.verifyPayment = async (req, res, next) => {
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
    const orderDetails = await service.getOrderDetails({
      orderNo: "#" + body?.order,
    });

    if (orderDetails && orderDetails?.payment?.referenceId) {
      switch (orderDetails?.paymentMethod) {
        case "network-international":
          // let referenceId = orderDetails?.payment?.referenceId;
          let networkInternationalOrderStatus =
            await retrieveNetworkInternationalOrderStatus(
              orderDetails,
              res,
              helper,
              messages,
              service
            );

          break;

        default:
          console.log("No payment gateway selected from list ");
          break;
      }
    } else {
      // console.log("resres",res)
      helper.deliverResponse(
        res,
        422,
        {},
        {
          error_code: messages.UNABLE_TO_VERIFY.error_code,
          error_message: messages.UNABLE_TO_VERIFY.error_message,
        }
      );
    }
  } catch (error) {
    // console.log("API error caught while verifying payment :: ", error);
    helper.deliverResponse(
      res,
      422,
      {},
      {
        error_code: messages.SERVER_ERROR.error_code,
        error_message: messages.SERVER_ERROR.error_message,
      }
    );
  }
};
// exports.buyNow = async (req, res) => {
//     try {
//         const body = req?.body;
//         const userid = res.locals?.user?._id;
//        const deviceToken = req?.headers?.devicetoken;

//         // Get product details
//         const product = await productService.getSingleProduct({
//             slug: body.product,
//             isActive: true,
//             isDelete: false
//         });

//         if (!product) {
//             return helper.deliverResponse(res, 404, {}, {
//                 "error_code": messages.PRODUCT_NOT_FOUND.error_code,
//                 "error_message": messages.PRODUCT_NOT_FOUND.error_message
//             });
//         }

//         // Create a new temporary cart for buy now
//         const cartData = {
//             isBuyNow: true,
//             products: [{
//                 product: product._id,
//                 quantity: body?.quantity || 1
//             }],
//             date: {
//                 added: new Date().toISOString()
//             }
//         };

//         if (userid) {
//             cartData.customer = userid;
//         } else if (deviceToken) {
//             let guest = await guestCustomerService.findOne({ token: deviceToken });

//             if (!guest) {
//                 // Create a new guest if token doesn't exist
//                 guest = await guestCustomerService.create({ token: deviceToken });
//             }
//             cartData.guest = guest._id;
//         }
//         else if (body?.guest) {
//             let guest = await guestCustomerService.findOne({ token: body?.guest });

//             if (!guest) {
//                 // Create a new guest if token doesn't exist
//                 guest = await guestCustomerService.create({ token: body?.guest });
//             }
//             cartData.guest = guest._id;
//         }

//         console.log(cartData,"cartDataeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee")

//         // Check if an existing Buy Now cart exists
//         if(userid){
//             console.log("userid",userid)
//             const existingCart = await cartService.getCart({ customer:userid, isBuyNow: true, isPurchased: false });
//         }
//         else if(deviceToken){
//             console.log("deviceToken",deviceToken)
//             const existingCart = await cartService.getCart({ guest: deviceToken, isBuyNow: true, isPurchased: false });
//         }
//         else if(body?.guest){
//        console.log(existingCart,"existingCart")

//         if (existingCart) {
//             console.log(existingCart,"existingCart")
//             // Update the existing cart instead of marking it as deleted
//             const updatedCart = await cartService.updateCart(
//                 { customer:userid, isBuyNow: true, isPurchased: false },
//                 cartData
//             );
//             return helper.deliverResponse(res, 200, { cartId: updatedCart._id }, {
//                 "error_code": messages.successResponse.error_code,
//                 "error_message": messages.successResponse.error_message
//             });
//         } else {
//             // Create a new Buy Now cart
//             const buyNowCart = await cartService.createCart(cartData);
//             return helper.deliverResponse(res, 200, { cartId: buyNowCart._id }, {
//                 "error_code": messages.successResponse.error_code,
//                 "error_message": messages.successResponse.error_message
//             });
//         }
//     } catch (error) {
//         console.error("Error in buyNow:", error);
//         return helper.deliverResponse(res, 422, error, {
//             "error_code": messages.serverError.error_code,
//             "error_message": messages.serverError.error_message
//         });
//     }
// };
exports.buyNow = async (req, res) => {
  try {
    const body = req?.body;
    const userid = res.locals?.user?.customerId;
    const deviceToken = req?.headers?.devicetoken;
    console.log(deviceToken, "deviceToken");
    console.log(res?.locals?.user, "userid of the  customer");
    // Get product details
    const product = await productService.getSingleProduct({
      slug: body.product,
      isActive: true,
      isDelete: false,
    });

    if (!product) {
      return helper.deliverResponse(
        res,
        404,
        {},
        {
          error_code: messages.PRODUCT_NOT_FOUND.error_code,
          error_message: messages.PRODUCT_NOT_FOUND.error_message,
        }
      );
    }

    // Create a new temporary cart for buy now
    const cartData = {
      isBuyNow: true,
      isPurchased: false,
      products: [
        {
          product: product._id,
          quantity: body?.quantity || 1,
        },
      ],
      date: {
        added: new Date().toISOString(),
      },
    };

    let cartQuery = { isBuyNow: true, isPurchased: false, isDelete: false };

    // Determine customer identification method and set appropriate fields
    if (userid) {
      cartData.customer = userid;
      cartQuery.customer = userid;
    } else if (deviceToken) {
      let guest = await guestCustomerService.findOne({ token: deviceToken });
      cartData.deviceToken = deviceToken;
      if (!guest) {
        // Create a new guest if token doesn't exist
        guest = await guestCustomerService.create({ token: deviceToken });
        cartData.guest = guest._id;
        cartQuery.guest = guest._id;
      }
    } else if (body?.guest) {
      let guest = await guestCustomerService.findOne({ token: body?.guest });

      if (!guest) {
        // Create a new guest if token doesn't exist
        guest = await guestCustomerService.create({ token: body?.guest });
      }
      cartData.guest = guest._id;
      cartQuery.guest = guest._id;
    }
    console.log(cartData, "cartDataeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee");

    // Check if an existing Buy Now cart exists
    const existingCart = await cartService.getCart(cartQuery);

    if (existingCart) {
      // Update the existing cart
      const updatedCart = await cartService.updateCart(
        { _id: existingCart._id },
        cartData
      );

      return helper.deliverResponse(
        res,
        200,
        { cartId: updatedCart._id },
        {
          error_code: messages.successResponse.error_code,
          error_message: messages.successResponse.error_message,
        }
      );
    } else {
      // Create a new Buy Now cart
      const buyNowCart = await cartService.createCart(cartData);

      return helper.deliverResponse(
        res,
        200,
        { cartId: buyNowCart._id },
        {
          error_code: messages.successResponse.error_code,
          error_message: messages.successResponse.error_message,
        }
      );
    }
  } catch (error) {
    console.error("Error in buyNow:", error);
    return helper.deliverResponse(res, 422, error, {
      error_code: messages.serverError.error_code,
      error_message: messages.serverError.error_message,
    });
  }
};

//   exports.buyNowOrder = async (req, res) => {
//     try {
//         const { productId, quantity = 1, address, paymentMethod, customerData } = req.body;

//         // Step 1: Get product details
//         const productDetails = await productService.getSingleProduct({
//             _id: productId,
//             isActive: true,
//             isDelete: false
//         });

//         if (!productDetails) {
//             return helper.deliverResponse(res, 404, {}, {
//                 "error_code": messages.PRODUCT_NOT_FOUND.error_code,
//                 "error_message": messages.PRODUCT_NOT_FOUND.error_message
//             });
//         }

//         // Step 2: Create a temporary cart for this single product
//         const cartData = {
//             isBuyNow: true,
//             products: [{
//                 product: productId,
//                 quantity: quantity
//             }],
//             date: {
//                 added: new Date().toISOString()
//             }
//         };

//         // Add customer or guest details
//         let customerDetails = {};
//         let guestDetails = {};
//         console.log("userid",res?.locals?.user)
//         if (res?.locals?.user?.userid) {
//             // For registered user

//             customerDetails = await customerService.getCustomer({
//                 userid: res?.locals?.user?.userid,
//                 isActive: true,
//                 isDelete: false
//             });
//             cartData.customer = customerDetails?._id;
//             console.log("customerDetails",customerDetails)
//         } else if (req.body.guest) {

//             // For guest user
//             guestDetails = await guestCustomerService.findOne({ token: req.body.guest });
//             console.log("guest",guestDetails)
//             if (!guestDetails) {
//                 guestDetails = await guestCustomerService.create({ token: req.body.guest });
//             }
//             cartData.guest = guestDetails?._id;
//         }
//         console.log("tempcart",cartData)
//         // Create the temporary cart
//         const tempCart = await cartService.createCart(cartData);

//         // Step 3: Set up order data
//         const settings = await settingsService.findOne({});
//         const orderCounts = await service.getOrderCounts({});

//         // Build order data
//         let data = {
//             cart: tempCart._id,
//             isBuyNow: true,
//             orderNo: `#${orderCounts + 1000}`,
//             invoiceNo: `INV${orderCounts + 1000}`,
//             paymentMethod: paymentMethod
//         };

//         // Add customer information
//         if (customerDetails?._id) {
//             data["customerId"] = customerDetails?._id;
//             data['customerType'] = "regd";
//         } else if (guestDetails?._id) {
//             data['guestId'] = guestDetails?._id;
//             data['customerType'] = "guest";
//         }

//         // Add address information
//         if (address) {
//             data['address'] = address;
//         } else if (res?.locals?.user?.userid) {
//             // Get default address for registered user
//             const addressDetails = await addressService.findOne({
//                 customer: customerDetails?._id,
//                 isDefaultShipping: true,
//                 isDelete: false
//             }, {});
//             data['address'] = addressDetails;
//         }

//         // Calculate product pricing
//         const productPrice = productDetails.price;
//         const productDiscount = productDetails.discount || 0;
//         // Don't redeclare quantity, use the one from the destructuring

//         const discountAmount = (productPrice * productDiscount / 100) * quantity;
//         const subtotal = productPrice * quantity;
//         const total = subtotal - discountAmount;

//         // Add product to order
//         data.products = [{
//             productId: productDetails._id,
//             quantity: quantity,
//             pricePerUnit: productPrice,
//             discountTotal: discountAmount,
//             mrpTotal: productPrice * quantity,
//             baseTotal: total,
//             taxTotal: productDetails.tax || 0,
//             total: total,
//             history: [{
//                 status: 'PENDING',
//                 date: new Date().toISOString()
//             }]
//         }];

//         // Set order calculations
//         data.orderDate = new Date();
//         data.subtotal = Number(subtotal.toFixed(2));
//         data.discount = Number(discountAmount.toFixed(2));
//         data.tax = Number((productDetails.tax || 0).toFixed(2));
//         data.total = Number(total.toFixed(2));
//         data.wholeTotal = Number(total.toFixed(2));

//         // Set order status for COD
//         if (paymentMethod == 'COD') {
//             data.orderStatus = "PLACED";
//         }

//         // Step 4: Process payment and create order
//         let response;
//         let paymentResponse = {};

//         if (paymentMethod == 'COD') {
//             // Create the order
//             response = await service.createOrder(data);

//             // Update product stock
//             let stock = productDetails?.stock - Number(quantity);
//             await productService.updateProduct(productDetails?._id, { stock: stock });

//             // Mark temporary cart as purchased
//             await cartService.updateCart({ _id: tempCart._id }, {
//                 isPurchased: true,
//                 isDelete: true,
//                 date: { purchased: new Date().toISOString() }
//             });

//             // Send order confirmation email
//             // Similar to your existing email sending code...
//             const subject = `Your order ${response?.orderNo} has been placed!`;
//             const content = `We're pleased to confirm your order no ${response?.orderNo}. Thank you for shopping with ${settings?.name}`;

//             // Format product for email
//             let products = [{
//                 thumbnail: BASE_URL + productDetails?.thumbnail,
//                 title: productDetails?.name,
//                 quantity: quantity,
//                 price: settings?.currency + " " + productPrice,
//                 total: settings?.currency + " " + total
//             }];

//             const orderDetails = {
//                 store: settings?.name,
//                 branding: BASE_URL + settings?.logo,
//                 total: settings?.currency + " " + data.wholeTotal,
//                 grandtotal: settings?.currency + " " + response.total,
//                 primaryColor: "#000000",
//                 secondaryColor: "#F3F5F7",
//                 name: customerDetails?.name || address?.firstname,
//                 products: products,
//                 paymentMethod: response?.paymentMethod,
//                 date: new Date(response?.createdAt).toDateString(),
//                 order: response?.orderNo,
//                 subtotal: settings?.currency + " " + response.subtotal,
//                 paymentMethod: response?.paymentMethod,
//                 tax: response?.tax,
//                 address: {
//                     lane: response?.address?.aptSuiteUnit ? response?.address?.streetAddress + ", " + response?.address?.aptSuiteUnit : response?.address?.streetAddress,
//                     city: response?.address?.city,
//                     state: response?.address?.state,
//                 }
//             };

//             const placedTemplate = templates.orderPlaced(orderDetails);

//             // Send email if customer email is available
//             if (customerDetails?.email) {
//                 await mailer.sendMail(customerDetails?.email, subject, content, placedTemplate);
//             }
//         } else if (paymentMethod === "network-international") {
//             data.paymentGateWay = "network-international";

//             const responseFromNetWorkInterNational = await processNetworkInternationalPayment(
//                 data,
//                 customerDetails,
//                 guestDetails
//             );

//             response = await service.createOrder(data);

//             if (responseFromNetWorkInterNational?.paymentError) {
//                 helper.deliverResponse(res, 400, "", {
//                     error_code: 1,
//                     error_message: "Unable to proceed with this payment method right now, please try again with another payment method",
//                 });
//                 return;
//             } else {
//                 paymentResponse = responseFromNetWorkInterNational?.paymentResponse || {};
//             }
//         }

//         // Step 5: Return response
//         if (response instanceof Error) {
//             helper.deliverResponse(res, 422, {}, {
//                 "error_code": messages.UNABLE_TO_PLACE_ORDER.error_code,
//                 "error_message": messages.UNABLE_TO_PLACE_ORDER.error_message
//             });
//             return;
//         } else {
//             helper.deliverResponse(res, 200, {
//                 orderNo: response?.orderNo,
//                 ...paymentResponse,
//             }, {
//                 "error_code": messages.successResponse.error_code,
//                 "error_message": messages.successResponse.error_message
//             });
//         }
//     } catch (error) {
//         console.error("Buy Now Order Error:", error);
//         helper.deliverResponse(res, 422, error, {
//             "error_code": messages.serverError.error_code,
//             "error_message": messages.serverError.error_message
//         });
//     }
// };
exports.buyNowOrder = async (req, res) => {
  try {
    let { body } = req;

    let paymentResponse = {};
    const settings = await settingsService.findOne({});

    // Get product details
    const productDetails = await productService.getSingleProduct({
      _id: body.productId,
      isActive: true,
      isDelete: false,
    });

    if (!productDetails) {
      return helper.deliverResponse(
        res,
        404,
        {},
        {
          error_code: messages.PRODUCT_NOT_FOUND.error_code,
          error_message: messages.PRODUCT_NOT_FOUND.error_message,
        }
      );
    }

    // Create a temporary cart for this single product
    const cartData = {
      isBuyNow: true,
      products: [
        {
          product: body.productId,
          quantity: body.quantity || 1,
        },
      ],
      date: {
        added: new Date().toISOString(),
      },
    };

    // Add customer information
    let customerDetails = {};
    let guestDetails = {};
    let addressDetails = {};

    if (res?.locals?.user?.userid) {
      // For registered user
      customerDetails = await customerService.getCustomer({
        userid: res?.locals?.user?.userid,
        isActive: true,
        isDelete: false,
      });
      cartData.customer = customerDetails?._id;
      addressDetails = await addressService.findOne(
        {
          customer: customerDetails?._id,
          isDefaultShipping: true,
          isDelete: false,
        },
        {}
      );
    } else if (body.guest) {
      // For guest user
      guestDetails = await guestCustomerService.findOne({ token: body.guest });
      if (!guestDetails) {
        guestDetails = await guestCustomerService.create({ token: body.guest });
      }
      cartData.guest = guestDetails?._id;
    }

    // Create the temporary cart
    const tempCart = await cartService.createCart(cartData);

    // Build order data structure
    let data = {
      cart: tempCart._id,
      isBuyNow: true,
    };

    if (res?.locals?.user?.userid) {
      data["customerId"] = customerDetails?._id;
      data["customerType"] = "regd";
    }
    if (body.guest) {
      data["guestId"] = guestDetails?._id;
      data["customerType"] = "guest";
    }

    // Handle address - Fix ObjectId issue
    if (body?.address) {
      try {
        // If user has selected address - Use proper ObjectId validation
        const mongoose = require("mongoose");
        const ObjectId = mongoose.Types.ObjectId;

        // Check if address ID is valid before querying
        const addressId = body.address.toString().trim();

        if (!ObjectId.isValid(addressId)) {
          return helper.deliverResponse(
            res,
            400,
            {},
            {
              error_code: 1,
              error_message: "Invalid address ID format",
            }
          );
        }

        const shippingAddress = await addressService.findOne({
          _id: addressId,
        });
        if (!shippingAddress) {
          return helper.deliverResponse(
            res,
            404,
            {},
            {
              error_code: 1,
              error_message: "Address not found",
            }
          );
        }
        data["address"] = shippingAddress;
      } catch (addressError) {
        console.error("Address lookup error:", addressError);
        return helper.deliverResponse(
          res,
          400,
          {},
          {
            error_code: 1,
            error_message:
              "Error processing address. Please check the address ID format.",
          }
        );
      }
    } else if (body?.guestAddress) {
      // If user has entered address
      data["address"] = body.guestAddress;
    } else {
      // If user has not selected address or entered address then default address will be used
      data["address"] = addressDetails;
    }

    const orderCounts = await service.getOrderCounts({});
    data["orderNo"] = `#${orderCounts + 1000}`;
    data["invoiceNo"] = `INV${orderCounts + 1000}`;
    data["paymentMethod"] = body?.paymentMethod;

    // Calculate product pricing - mimicking the getCartSummary functionality
    let productPrice = productDetails.price;
    let quantity = body.quantity || 1;
    let discountPercentage = productDetails.discount || 0;
    let discountAmount = ((productPrice * discountPercentage) / 100) * quantity;
    let subtotal = productPrice * quantity;
    let baseTotal = subtotal - discountAmount;
    let taxAmount = (productDetails.tax || 0) * quantity;
    let shippingCharge = settings?.shippingCharge || 0;
    let giftWrapTotal = 0;

    // Add shipping note if provided
    if (body?.shippingnote) {
      data["shippingnotes"] = body.shippingnote;
    }

    // Prepare products array for the order
    data.products = [
      {
        productId: productDetails._id,
        quantity: quantity,
        pricePerUnit: productPrice,
        discountPercentage: discountPercentage,
        discountTotal: discountAmount,
        mrpTotal: subtotal,
        baseTotal: baseTotal,
        taxTotal: taxAmount,
        total: baseTotal + taxAmount,
        history: [
          {
            status: "PENDING",
            date: new Date().toISOString(),
          },
        ],
      },
    ];

    // Set order calculations
    data.orderDate = new Date();
    data.subtotal = Number(subtotal.toFixed(2));
    data.discount = Number(discountAmount.toFixed(2));
    data.tax = Number(taxAmount.toFixed(2));
    data.total = Number((baseTotal + taxAmount).toFixed(2));
    data.wholeTotal = Number(
      (baseTotal + taxAmount + shippingCharge + giftWrapTotal).toFixed(2)
    );
    data.shippingCharge = Number(shippingCharge.toFixed(2));
    data.giftWrapTotal = Number(giftWrapTotal.toFixed(2));

    // Set order status for COD
    if (body.paymentMethod == "COD") {
      data.orderStatus = "PLACED";
    }

    // Process payment and create order
    let response;

    if (body.paymentMethod == "COD") {
      // Create the order
      response = await service.createOrder(data);

      // Update product stock
      let stock = productDetails?.stock - Number(quantity);
      await productService.updateProduct(productDetails?._id, { stock: stock });

      // Mark temporary cart as purchased
      await cartService.updateCart(
        { _id: tempCart._id },
        {
          isPurchased: true,
          date: { purchased: new Date().toISOString() },
        }
      );

      // Prepare email notification
      let products = [
        {
          thumbnail: BASE_URL + productDetails?.thumbnail,
          title: productDetails?.name,
          quantity: quantity,
          price: settings?.currency + " " + productPrice,
          total: settings?.currency + " " + (baseTotal + taxAmount),
        },
      ];

      const subject = `Your order ${response?.orderNo} has been placed!`;
      const content = `We're pleased to confirm your order no ${response?.orderNo}. Thank you for shopping with ${settings?.name}`;

      const orderDetails = {
        store: settings?.name,
        branding: BASE_URL + settings?.logo,
        total: settings?.currency + " " + data.wholeTotal,
        grandtotal: settings?.currency + " " + response.total,
        primaryColor: "#000000",
        secondaryColor: "#F3F5F7",
        name: customerDetails?.name || data?.address?.firstname,
        products: products,
        paymentMethod: response?.paymentMethod,
        date: new Date(response?.createdAt).toDateString(),
        order: response?.orderNo,
        subtotal: settings?.currency + " " + response.subtotal,
        paymentMethod: response?.paymentMethod,
        additionalCharge: response?.additionalCharge,
        tax: response?.tax,
        giftWrapTotal: response?.giftWrapTotal,
        address: {
          lane: response?.address?.aptSuiteUnit
            ? response?.address?.streetAddress +
              ", " +
              response?.address?.aptSuiteUnit
            : response?.address?.streetAddress,
          city: response?.address?.city,
          state: response?.address?.state,
        },
      };

      const placedTemplate = templates.orderPlaced(orderDetails);

      // Send email if customer email is available
      if (customerDetails?.email) {
        await mailer.sendMail(
          customerDetails?.email,
          subject,
          content,
          placedTemplate
        );
      }
    } else if (body.paymentMethod === "network-international") {
      data.paymentGateWay = "network-international";

      const responseFromNetWorkInterNational =
        await processNetworkInternationalPayment(
          data,
          customerDetails,
          guestDetails
        );

      response = await service.createOrder(data);

      if (responseFromNetWorkInterNational?.paymentError) {
        helper.deliverResponse(res, 400, "", {
          error_code: 1,
          error_message:
            "Unable to proceed with this payment method right now, please try again with another payment method",
        });
        return;
      } else {
        paymentResponse =
          responseFromNetWorkInterNational?.paymentResponse || {};
      }
    }

    // Return response
    if (response instanceof Error) {
      helper.deliverResponse(
        res,
        422,
        {},
        {
          error_code: messages.UNABLE_TO_PLACE_ORDER.error_code,
          error_message: messages.UNABLE_TO_PLACE_ORDER.error_message,
        }
      );
    } else {
      helper.deliverResponse(
        res,
        200,
        {
          orderNo: response?.orderNo,
          ...paymentResponse,
        },
        {
          error_code: messages.successResponse.error_code,
          error_message: messages.successResponse.error_message,
        }
      );
    }
  } catch (error) {
    console.error("Buy Now Order Error:", error);
    helper.deliverResponse(res, 422, error, {
      error_code: messages.serverError.error_code,
      error_message: messages.serverError.error_message,
    });
  }
};
