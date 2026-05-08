const helper = require("../../../../util/responseHelper");
const app_helper = require("../../../../util/appWebResponse");
const { body, validationResult } = require("express-validator");
const messages = require("../../../../config/constants").messages;
const service = require("../../../services/cart.service");
const customerService = require("../../../services/customer.service");
const products_service = require("../../../services/product.service");
const { themeSettings } = require("../../../../config/constants");
const { BASE_URL } = require("../../../../config/constants/common");
const offer_service = require("../../../services/offer.service");
const collection_service = require("../../../services/collection.service");
const couponService = require("../../../services/coupon.service");
const priceCheck = require('../../../../util/priceCheck')
const settingsService = require('../../../services/general.settings.service')
const authorize = require("../../../middlewares/authorize")
const jwt = require('jsonwebtoken')
const constant = require("../../../../config/constants");
const key = constant.common.KEYS
const admin = require("firebase-admin")
const notificationService = require("../../../services/notification.service")

exports.validate = (method) => {
  switch (method) {
    case "create": {
      return [
        body("prodid", "Product required").exists(),
        body("quantity", "Quantity required").exists(),
      ];
    }
    case "update": {
      return [
        body("cartid", "Cart Id required").exists(),
        body("prodid", "Product required").exists(),
      ];
    }
  }
};

exports.addToCart = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      helper.deliverResponse(res, 422, errors, {
        error_code: messages.VALIDATION_ERROR.error_code,
        error_message: messages.VALIDATION_ERROR.error_message,
      });
      return;
    }
    let { body } = req;
    let cart = "";
    let prices = []
    let collection = []
    let category = []
    let msg = {}
    let data = {}
    const userid = res.locals?.user?.userid;
    const check = await service.getCart({ "customer.refid": userid, isDelete: false, isActive: true, status: "Unordered" });
    const product = await products_service.getSingleProduct({ isActive: true, isDelete: false, prodid: body["prodid"], });
    const sellingprice = product?.price?.offer
    prices.push(sellingprice)
    category.push(...product.category.id);
    for (let _cat of product?.product?.id?.parentCategory?.id) {
      if (!category.includes(_cat?._id)) {
        category.push(_cat?._id);
      }
    }
    const leastamount = await priceCheck.productPriceCheck(product?._id, product?.name, category, collection, prices, sellingprice)
    const totalPrice = body['quantity'] * leastamount;

    if (product["stock"] >= body["quantity"]) {
      if (check == null) {
        const count = await service.getCartCount({});
        let products = [];
        const customer = await customerService.getCustomer({ isActive: true, isDelete: false, userid: userid });
        body.customer = { id: customer["_id"], refid: userid };
        body.products = products;
        body.refid = count + 1000;
        body.status = "Unordered";
        body.cartid = count + 1000;
        body.total = totalPrice
        body.date = {
          added: new Date().toISOString()
        }
        products.push({ product: product["_id"], quantity: body["quantity"], total: totalPrice });
        cart = await service.createCart(body);
        console.log('Product added to cart. Customer :: ' + customer?.name);
      } else {
        const cartid = check["refid"];
        let isPresent = false;
        for (let products of check["products"]) {
          if (String(products["product"]["_id"]) == String(product["_id"])) {
            isPresent = true;
          }
        }
        if (!isPresent) {
          const data = { product: product["_id"], quantity: body["quantity"], total: totalPrice }
          await service.addProduct(cartid, data);
          cart = { quantity: body["quantity"] }
          cartDetails = await service.getCart({ "customer.refid": userid, isDelete: false, isActive: true, status: "UNORDERED" });
          let totalSum = 0
          const cartProducts = cartDetails?.products
          for (let product of cartProducts) totalSum += Number(product?.total)
          await service.updateCart({ refid: cartid }, { $set: { total: totalSum } })
        } else {
          msg = {
            error_code: messages.PRODUCT_ALREADY_PRESENT.error_code,
            error_message: messages.PRODUCT_ALREADY_PRESENT.error_message,
          }
          data = {}
        }
      }
      data = cart
      msg = {
        error_code: messages.successResponse.error_code,
        error_message: messages.successResponse.error_message,
      }
    } else {
      data = {}
      msg = {
        error_code: messages.LIMITED_STOCK.error_code,
        error_message: messages.LIMITED_STOCK.error_message,
      }
    }
    app_helper.deliverResponse(res, 200, data, msg, true);
  } catch (error) {
    console.error("Error caught while adding items to cart :: " + error);
    app_helper.deliverResponse(res, 422, {}, {
      error_code: messages.serverError.error_code,
      error_message: messages.serverError.error_message,
    });
  }
};

exports.updateCartQuantity = async (req, res) => {
  try {
    const { body } = req;
    const userid = res.locals?.user?.userid;
    let prices = []
    let collection = []
    let category = []
    let data = []
    const cart = await service.getCart({ "customer.refid": userid, isDelete: false, isActive: true, status: "UNORDERED" });
    const product = await products_service.getSingleProduct({ isActive: true, isDelete: false, prodid: body["prodid"] });
    const sellingprice = product?.price?.offer
    prices.push(sellingprice)
    category.push(...product.category.id);
    for (let _cat of product?.product?.id?.parentCategory?.id) {
      if (!category.includes(_cat?._id)) {
        category.push(_cat?._id);
      }
    }
    const leastamount = await priceCheck.productPriceCheck(product?._id, product?.name, category, collection, prices, sellingprice)
    const totalPrice = body['quantity'] * leastamount;
    if (cart != null) {
      if (product["stock"] >= body["quantity"]) {
        const checkProduct = await service.getCart({ "customer.refid": userid, "products.product": product["_id"], isDelete: false, isActive: true });
        if (checkProduct) {
          if (body["quantity"] && body["quantity"] > 0) {
            const query = { "customer.refid": userid, "products.product": product["_id"], isDelete: false, isActive: true };
            const removeAction = { $pull: { products: { product: product["_id"] } } };
            data.push({ product: product["_id"], quantity: body["quantity"], total: totalPrice });
            const removedCart = await service.updateCart(query, removeAction);
            if (removedCart) {
              const addedCart = await service.addProduct(cart["refid"], data);
              const cartDetails = await service.getCart({ "customer.refid": userid, isDelete: false, isActive: true, status: "UNORDERED" });
              let totalSum = 0
              const cartProducts = cartDetails?.products
              for (let product of cartProducts) totalSum += Number(product?.total)
              await service.updateCart(query, { $set: { total: totalSum } })
              if (addedCart) response = { quantity: body["quantity"] }
              app_helper.deliverResponse(res, 200, response, {
                error_code: messages.CART_UPDATED.error_code,
                error_message: messages.CART_UPDATED.error_message,
              }, true);
            }
          } else {
            app_helper.deliverResponse(res, 422, {}, {
              error_code: messages.QUANTITY_REQUIRED.error_code,
              error_message: messages.QUANTITY_REQUIRED.error_message,
            }, true);
          }
        } else {
          app_helper.deliverResponse(res, 422, {}, {
            error_code: messages.PRODUCT_NOT_FOUND.error_code,
            error_message: messages.PRODUCT_NOT_FOUND.error_message,
          }, true);
        }
      } else {
        app_helper.deliverResponse(res, 200, {}, {
          error_code: messages.LIMITED_STOCK.error_code,
          error_message: messages.LIMITED_STOCK.error_message,
        }, true);
      }
    } else {
      app_helper.deliverResponse(res, 200, {}, {
        error_code: messages.EMPTY_CART.error_code,
        error_message: messages.EMPTY_CART.error_message,
      }, true);
    }
  } catch (error) {
    console.log("Error caught while updating cart :: " + error);
    app_helper.deliverResponse(res, 422, {}, {
      error_code: messages.serverError.error_code,
      error_message: messages.serverError.error_message,
    });
  }
};

exports.cartCount = async (req, res) => {
  try {
    const userid = res.locals?.user?.userid;
    let count = 0
    const cartcount = await service.getCart({ isDelete: false, isActive: true, "customer.refid": userid, status: "UNORDERED" });
    if (cartcount) count = cartcount?.products.length;
    const result = {
      count: count,
    };
    app_helper.deliverResponse(res, 200, result, {
      error_code: messages.successResponse.error_code,
      error_message: messages.successResponse.error_message,
    });
  } catch (error) {
    console.log(error);
    app_helper.deliverResponse(res, 422, {}, {
      error_code: messages.serverError.error_code,
      error_message: messages.serverError.error_message,
    });
  }
};

exports.cartDetails = async (req, res) => {
  try {
    const userid = res.locals?.user?.userid;
    const cart = await service.getCart({ isDelete: false, isActive: true, status: "UNORDERED", "customer.refid": userid });
    const settings = await settingsService.findOne({ refid: "100" })
    if (cart) {
      let products = [];
      let coupons = [];
      let applicableCoupons = [];
      let tax = 0;
      let priceBefore = 0;
      let priceAfter = 0;
      let total = 0;
      let discountAmount = 0;
      let shipping = [];
      let cod = [];
      let count = 0;
      let shippingmethod = [];
      let couponarr = [];
      let leastamount = 0;
      for (let product of cart?.products) {
        count += 1;
        let stock = product?.product?.stock;
        let prices = [];
        const sellingprice = product?.product?.price?.offer;
        let category = [];
        let collection = [];

        shipping.push({
          method: product?.product?.product.id.shipping?.method,
          cost: product?.product?.product?.id.shipping?.value,
        });

        cod.push({
          present: product?.product?.product?.id?.cod?.isPresent,
          cost: product?.product?.product?.id?.cod?.value,
        });

        prices.push(sellingprice);
        if (product?.category) {
          category.push(...product?.category?.id);
        }

        for (let _cat of product?.product?.product?.id?.parentCategory?.id) {
          if (!category.includes(_cat?._id)) {
            category.push(_cat?._id);
          }
        }

        const offers_product = await offer_service.find({
          products: { $in: [product?.product?._id] },
          isActive: true,
          isDelete: false,
          fromDate: { $lte: new Date(new Date().setHours(0, 0, 0, 0)) },
          lastDate: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        });
        const offers_category = await offer_service.find({
          categories: { $in: category },
          isActive: true,
          isDelete: false,
          fromDate: { $lte: new Date(new Date().setHours(0, 0, 0, 0)) },
          lastDate: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        });
        const collections = await collection_service.find({
          products: { $in: [product?.product?._id] },
          isActive: true,
          isDelete: false,
          isArchive: false,
        });

        for (let col of collections) {
          if (!collection.includes(col._id)) {
            collection.push(col._id);
          }
        }

        const offers_collection = await offer_service.find({
          collections: { $in: collection },
          isActive: true,
          isDelete: false,
          fromDate: { $lte: new Date(new Date().setHours(0, 0, 0, 0)) },
          lastDate: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        });

        const couponProjection = {
          title: 1,
          code: 1,
          minPurchase: 1,
          type: 1,
          value: 1,
          couponid: 1,
          _id: 1,
        };

        const coupons_product = await couponService.getActiveCoupon(
          {
            products: { $in: [product?.product?._id] },
            isActive: true,
            isDelete: false,
            fromDate: { $lte: new Date().toUTCString() },
            lastDate: { $gte: new Date().toUTCString() },
          },
          couponProjection
        );

        const coupons_category = await couponService.getActiveCoupon(
          {
            categories: { $in: category },
            isActive: true,
            isDelete: false,
            fromDate: { $lte: new Date().toUTCString() },
            lastDate: { $gte: new Date().toUTCString() },
          },
          couponProjection
        );

        const coupons_collection = await couponService.getActiveCoupon(
          {
            collections: { $in: collection },
            isActive: true,
            isDelete: false,
            fromDate: { $lte: new Date().toUTCString() },
            lastDate: { $gte: new Date().toUTCString() },
          },
          couponProjection
        );

        coupons.push(...coupons_category);
        coupons.push(...coupons_collection);
        coupons.push(...coupons_product);
        couponarr = [...new Map(coupons.map((v) => [v.couponid, v])).values()];

        if (offers_product.length > 0) {
          for (let offer of offers_product) {
            let discount = "";
            if (offer["type"] == "%") {
              discount =
                sellingprice - sellingprice * Number(offer["value"] / 100);
            } else if (offer["type"] == "Flat") {
              discount = sellingprice - Number(offer["value"]);
            }
            discount = Math.round(discount);
            if (!prices.includes(discount)) {
              prices.push(discount);
            }
          }
        }

        if (offers_category.length > 0) {
          for (let offer of offers_category) {
            let discount = "";
            if (offer["type"] == "%") {
              discount =
                sellingprice - sellingprice * Number(offer["value"] / 100);
            } else if (offer["type"] == "Flat") {
              discount = sellingprice - Number(offer["value"]);
            }
            discount = Math.round(discount);
            if (!prices.includes(discount)) {
              prices.push(discount);
            }
          }
        }

        if (offers_collection.length > 0) {
          for (let offer of offers_collection) {
            let discount = "";
            if (offer["type"] == "%") {
              discount =
                sellingprice - sellingprice * Number(offer["value"] / 100);
            } else if (offer["type"] == "Flat") {
              discount = sellingprice - Number(offer["value"]);
            }
            discount = Math.round(discount);
            if (!prices.includes(discount)) {
              prices.push(discount);
            }
          }
        }

        leastamount = prices.reduce((a, b) => Math.min(a, b));

        if (leastamount <= 0) {
          leastamount = sellingprice;
        }

        for (let coupon of couponarr) {
          if (leastamount * product?.quantity >= coupon?.minPurchase) {
            if (applicableCoupons.length > 0) {
              const couponid = (obj) =>
                obj.params.couponid === coupon?.couponid;
              const isId = applicableCoupons.some(couponid);
              if (!isId) {
                applicableCoupons.push({
                  name: { text: coupon?.title, color: themeSettings.colors.PRIMARY },
                  code: { text: coupon?.code, color: themeSettings.colors.BLACK },
                  type: { text: coupon?.type, color: themeSettings.colors.BLACK },
                  value: { text: coupon?.value, color: themeSettings.colors.PRIMARY },
                  params: { couponid: coupon?.couponid },
                });
              }
            } else {
              applicableCoupons.push({
                name: { text: coupon?.title, color: themeSettings.colors.PRIMARY },
                type: { text: coupon?.code, color: themeSettings.colors.BLACK },
                type: { text: coupon?.type, color: themeSettings.colors.BLACK },
                value: { text: coupon?.value, color: themeSettings.colors.PRIMARY },
                params: { couponid: coupon?.couponid },
              });
            }
          }
        }

        const totalPrice = product?.quantity * leastamount;
        total += totalPrice;
        const rate = product?.product?.product?.id?.tax?.rate;
        const salesTaxRate = rate / 100;
        const priceBeforeTax = totalPrice / (1 + salesTaxRate);
        const salesTax = priceBeforeTax * salesTaxRate;
        const priceAfterTax = priceBeforeTax + salesTax;
        priceBefore += priceBeforeTax;
        priceAfter += priceAfterTax;
        tax += salesTax;

        shipping = shipping.filter((data) => data.cost != null);
        const shippingcost = shipping.reduce((a, b) =>
          Math.max(a.cost, b.cost)
        );
        for (let ship of shipping) {
          if (ship.cost == shippingcost["cost"]) {
            shippingmethod.push(ship);
          }
        }

        let isStock = true;
        let stockMessage = {
          text: "In Stock",
          color: settings?.colors?.primary,
        };
        if (stock == 0) {
          isStock = false;
          stockMessage = {
            text: "Out of Stock",
            color: themeSettings.colors.RED,
          };
        }

        products.push({
          product: product?.product?.prodid,
          product_count: product?.quantity,
          name: {
            text: product?.product?.name,
          },
          image: BASE_URL + product?.product?.thumbnail,
          actual_price: {
            text: "₹ " + (product?.product?.price?.mrp).toFixed(2),
          },
          price: {
            text: "₹ " + leastamount.toFixed(2),
          },
          isStock: isStock,
          stock: stockMessage,
        });
      }

      if (cart?.coupon?.id) {
        const type = cart?.coupon?.id?.type;
        switch (type) {
          case "Flat":
            discountAmount = Number(cart?.coupon?.id?.value).toFixed(2);
            total = total - cart?.coupon?.id?.value;
            break;
          case "%":
            discountAmount = (total * (cart?.coupon?.id?.value / 100)).toFixed(
              2
            );
            total = Math.round(total - total * (cart?.coupon?.id?.value / 100));
            break;
        }
      }

      total = total + shippingmethod[0]["cost"];
      let result = {
        address: {
          to: {
            text: "Deliver to " + cart?.customer?.id?.name,
          },
          address_text: {
            text:
              cart?.customer?.id?.address?.firstline +
              ", " +
              cart?.customer?.id?.address?.secondline +
              ", " +
              cart?.customer?.id?.address?.area +
              ", " +
              cart?.customer?.id?.address?.landmark +
              ", " +
              cart?.customer?.id?.address?.city +
              ", " +
              cart?.customer?.id?.address?.pincode +
              ", " +
              cart?.customer?.id?.address?.state,
          },
          edit_button: {
            label: {
              text: "Change",
            },
            bgcolor: [settings?.colors?.primary],
            visible: true,
          },
        },
        cart_items: products,
        coupon: {
          data: applicableCoupons,
          title: {
            text: "Add Coupon Code",
          },
          textfield: {
            field: "textfield",
            field_name: "coupon",
            placeholder: {
              text: "Enter Coupon Code",
            },
          },
          button: {
            label: {
              text: "Apply",
            },
            bgcolor: [settings?.colors?.primary],
          },
          description: {
            text: "Apply Gift cards, Voucher and Promotional codes  ( If any )",
          },
        },
        price_details: {
          title: { text: "Order Summary" },
          details: [
            {
              key: { text: `Price ( ${count} items )` },
              value: { text: "₹ " + priceBefore.toFixed(2) },
            },
            {
              key: { text: "Discount" },
              value: { text: "₹ " + discountAmount, },
            },
            {
              key: { text: `GST` },
              value: { text: "₹ " + tax.toFixed(2) },
            },
            {
              key: { text: `Shipping Cost` },
              value: { text: "₹ " + (shippingmethod[0]?.cost).toFixed(2) },
            },
            {
              key: { text: `Total` },
              value: { text: "₹ " + total.toFixed(2), color: themeSettings.colors.PRIMARY },
            },
          ],
          total: {
            key: { text: "Total Amount" },
            value: { text: "₹ " + total.toFixed(2) },
          },
        },
        bottom_details: {
          title: {
            text: "Order Total",
            color: themeSettings.colors.BLACK,
          },
          actualprice: {
            text: "₹ " + total.toFixed(2),
            color: settings?.colors?.primary,
            "font-size": themeSettings.fonts.TITLE_SIZE
          },
          button_data: {
            label: {
              text: "Checkout",
              color: themeSettings.colors.WHITE,
            },
            bgcolor: [settings?.colors?.primary],
            type: 1,
            action: "/order-summary",
            params: {
              refid: cart?.refid,
            },
          },
          bgcolor: [themeSettings.colors.WHITE],
          height: "100",
        },
      };

      if (!cart?.customer?.id?.address) {
        result.address.address_text.text = 'Add delivery address'
        result.address.edit_button.label.text = 'Add'
      }

      app_helper.deliverResponse(res, 200, result, {
        error_code: messages.successResponse.error_code,
        error_message: messages.successResponse.error_message,
      });
    } else {
      const response = {
        empty: {
          image: { image: "", Displaystatus: true },
          title: { text: "Empty Cart" },
          subtitle: { text: "Purchase products now" },
          buttondata: {
            label: {
              text: "Continue Shopping",
              bgcolor: themeSettings.colors.PRIMARY,
              color: themeSettings.colors.WHITE,
              font: themeSettings.fonts.FONT_FAMILY,
              "font-style": themeSettings.fonts.FONT_STYLE,
              "font-size": themeSettings.fonts.BUTTON_FONT_SIZE,
              "font-weight": themeSettings.fonts.FONT_SEMIBOLD
            },
            action: '/dashboard-view',
            bgcolor: [themeSettings.colors.PRIMARY],
          },
          isempty: true,
        }
      }

      app_helper.deliverResponse(res, 200, response, {
        error_code: messages.EMPTY_CART.error_code,
        error_message: messages.EMPTY_CART.error_message,

      });
    }
  } catch (error) {
    console.error(error);
    app_helper.deliverResponse(res, 422, {}, {
      error_code: messages.serverError.error_code,
      error_message: messages.serverError.error_message,
    });
  }
};

exports.applyCoupon = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      helper.deliverResponse(res, 422, errors, {
        error_code: messages.VALIDATION_ERROR.error_code,
        error_message: messages.VALIDATION_ERROR.error_message,
      });
      return;
    }
    const userid = res.locals["user"]["userid"];
    let { body } = req;
    const cartid = body["cartid"];
    let data = {};
    const user = await customerService.getCustomer({ userid: userid, isActive: true, isDelete: false })
    const coupon = await couponService.findCoupon({ couponid: body["couponid"], isActive: true, isDelete: false });

    if (coupon != {}) {
      data["coupon"] = {
        id: coupon["_id"],
        refid: body["couponid"],
      };
    }
    let cart = await service.applyCoupon(cartid, data);
    helper.deliverResponse(res, 200, cart, {
      error_code: messages.COUPON_APPLIED.error_code,
      error_message: messages.COUPON_APPLIED.error_message,
    });
  } catch (error) {
    app_helper.deliverResponse(res, 422, {}, {
      error_code: messages.serverError.error_code,
      error_message: messages.serverError.error_message,
    });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    let { body } = req;
    let cart = "";
    const userid = res.locals["user"]["userid"];
    const check = await service.getCart({ "customer.refid": userid, isDelete: false, isActive: true, status: "UNORDERED" });
    if (check["products"].length == 0) {
      cart = { message: "Add some items to cart" };
    } else {
      const product = await products_service.getSingleProduct({
        isActive: true,
        isDelete: false,
        prodid: body["prodid"],
      });
      const checkProduct = await service.getCart({
        "customer.refid": userid,
        "products.product": product["_id"],
        isDelete: false,
        isActive: true,
      });
      if (checkProduct) {
        const query = { "customer.refid": userid, "products.product": product["_id"], isDelete: false, isActive: true, };
        const removeAction = {
          $pull: { products: { product: product["_id"] } },
        };
        const cart = await service.updateCart(query, removeAction);
        if (cart?.products.length == 0) {
          await service.updateCart({ "customer.refid": userid, isDelete: false, isActive: true, status: "UNORDERED" }, { $set: { isDelete: true } });
        }
      }
    }
    app_helper.deliverResponse(res, 200, cart, {
      error_code: messages.successResponse.error_code,
      error_message: messages.successResponse.error_message,
    });
  } catch (error) {
    console.error("Error caught while removing items from cart :: " + error);
    app_helper.deliverResponse(res, 422, {}, {
      error_code: messages.serverError.error_code,
      error_message: messages.serverError.error_message,
    });
  }
};

exports.getCart = async (req, res, next) => {
  try {
    const { body } = req
    let users = []
    let productIds = []
    let data = { isDelete: false, isPurchased: false }
    
    // Validate and sanitize input data
    if (body?.keyword) {
      const customers = await customerService.getClient({ 
        name: { $regex: body?.keyword, $options: 'i' }, 
        isActive: true, 
        isDelete: false 
      })
      const products = await products_service.getAllProduct({ 
        $or: [
          { name: { $regex: body?.keyword, $options: 'i' } }, 
          { sku: { $regex: body?.keyword, $options: 'i' } }
        ]
      })
      
      for (let customer of customers) {
        if (customer?._id) users.push(customer._id)
      }
      for (let product of products) {
        if (product?._id) productIds.push(product._id)
      }
      
      if (users.length > 0) data['customer.id'] = { $in: users }
      if (productIds.length > 0) data['products.product'] = { $in: productIds }
    }

    if (body?.isActive) data['isActive'] = body?.isActive
    
    // Handle date filtering
    if (body?.fromDate || body?.toDate) {
      data['date.added'] = {}
      if (body?.fromDate) {
        data['date.added'].$gte = new Date(new Date(body.fromDate).setHours(0, 0, 0, 0))
      }
      if (body?.toDate) {
        data['date.added'].$lte = new Date(new Date(body.toDate).setHours(23, 59, 59, 999))
      }
    }

    const response = await service.searchCarts(data, body?.page, body?.limit);
    
    helper.deliverResponse(res, 200, response, {
      error_code: messages.successResponse.error_code,
      error_message: messages.successResponse.error_message,
    });
  } catch (error) {
    console.error("Error caught in get carts:", error);
    
    // Send appropriate error response based on error type
    if (error.name === 'CastError') {
      helper.deliverResponse(res, 400, {}, {
        error_code: 'INVALID_ID',
        error_message: 'Invalid ID format provided',
      });
    } else {
      helper.deliverResponse(res, 422, {}, {
        error_code: messages.serverError.error_code,
        error_message: messages.serverError.error_message,
      });
    }
  }
};

exports.sendPushNotification = async (req, res, next) => {
  try {
    const { body } = req
    const settings = await settingsService.findOne({ })
    let message = body?.message
    const cart = await service.getCart({ isActive: true, isDelete: false, isPurchased: false, refid: body?.refid })
    if (cart) {
      const customer = await customerService.getCustomer({ userid: cart?.customer?.refid, isActive: true, isDelete: false })
      if (body?.couponCode) {
        const coupon = await couponService.getCouponDetails({ code: body?.couponCode, isActive: true, isDelete: false, isVisibility: false })
        if (coupon) message = body['message'] + '. Use coupon code ' + body?.couponCode + ' to avail discount.'
      }
      if (customer?.deviceTokens.length > 0) {
        admin.messaging().sendEachForMulticast(pushMessage).then(async (response) => {
          let notificationPayload = {
            customers: [{ id: customer?._id, status: 'Sent' }],
            title: body?.title,
            content: message,
            channel: 'push',
            type: 'instant',
            redirect: settings?.domain + '/cart',
            status: 'Sent',
            total: '1',
            refid: await notificationService.getNotificationCount({}) + 1
          }

          const notificationDetails = await notificationService.createNotification(notificationPayload)
          if (notificationDetails instanceof Error) {
            helper.deliverResponse(res, 200, {}, {
              error_code: messages.NOTIFICATION_FAILURE.error_code,
              error_message: messages.NOTIFICATION_FAILURE.error_message,
            });
          } else {
            helper.deliverResponse(res, 200, {}, {
              error_code: messages.NOTIFICATION_SENT.error_code,
              error_message: messages.NOTIFICATION_SENT.error_message,
            });
          }
        }).catch((error) => {
          helper.deliverResponse(res, 200, error, {
            error_code: messages.NOTIFICATION_FAILURE.error_code,
            error_message: messages.NOTIFICATION_FAILURE.error_message,
          });
        });

      } else {
        helper.deliverResponse(res, 200, {}, {
          error_code: messages.USER_LOGGEDOUT.error_code,
          error_message: messages.USER_LOGGEDOUT.error_message,
        });
      }
    } else {
      helper.deliverResponse(res, 200, {}, {
        error_code: messages.CART_NOT_FOUND.error_code,
        error_message: messages.CART_NOT_FOUND.error_message,
      });
    }
  } catch (error) {
    console.log('Error caught in send push notification in cart API :: ' + error)
    helper.deliverResponse(res, 422, {}, {
      error_code: messages.serverError.error_code,
      error_message: messages.serverError.error_message,
    });
  }
}

exports.notification = async (req, res) => {
  try {
    const { body } = req
    const cartDetails = await service.getCart({ refid: body?.cart })
    const customerDetails = await customerService.getCustomer({ _id: cartDetails?.customer?.id?._id, isActive: true, isDelete: false })
    console.log(customerDetails)
    console.log(body)
  } catch (error) {
    console.log('Error caught in send cart notification api :: ' + error)
    helper.deliverResponse(res, 422, {}, {
      error_code: messages.serverError.error_code,
      error_message: messages.serverError.error_message,
    });
  }
}

exports.getCartProducts = async (req, res) => {
  try {
    const { body } = req
    const cart = await service.getCart({ _id: body?.cart })
    helper.deliverResponse(res, 200, cart, {
      error_code: messages.successResponse.error_code,
      error_message: messages.successResponse.error_message,
    });
  } catch (error) {
    helper.deliverResponse(res, 422, {}, {
      error_code: messages.serverError.error_code,
      error_message: messages.serverError.error_message,
    });
  }
}