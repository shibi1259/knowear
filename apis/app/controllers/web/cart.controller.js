const helper = require("../../../util/responseHelper");
const { body, validationResult } = require("express-validator");
const messages = require("../../../config/constants").messages;
const service = require("../../services/cart.service");
const customerService = require("../../services/customer.service");
const productsService = require("../../services/product.service");
const couponService = require("../../services/coupon.service");
const priceCheck = require("../../../util/priceCheck");
const settingsService = require("../../services/general.settings.service");
const { BASE_URL } = require("../../../config/constants/common");
const collectionService = require("../../services/collection.service");
const productHeadService = require("../../services/product.head.service");
const guestService = require("../../services/guest.service");
const loyaltyService = require("../../services/loyalty.service");
const shipping = require("../../../util/shippingCalculation");
const cart = require("../../api/v1/web/cart");
const bannerImageService = require("../../services/banner.image.service");
const giftWrapService = require("../../services/gift.wrap.service");
const { applyCoupon } = require("../../../util/applyCoupon");
const { getApplicableCoupons } = require("../../../util/couponListing");
const { getCartSummary } = require("../../../util/getCartSummary");
const { getProductResponse } = require("../../../util/productResponse");
const productHeadModel = require("../../db/models/product.head.model");
const taxRulesModel = require("../../db/models/tax.rules.model");
const PostShippingService = require("../../../util/shipping");
const ShippingService=require("../../services/shipping.service")
const ObjectId = require("mongoose").Types.ObjectId;
const shippingNoteService=require("../../services/shippingnote.service")

exports.validate = (method) => {
  switch (method) {
    case "add": {
      return [
        body("product", "Product is required").exists(),
        body("quantity", "Quantity is required").exists(),
      ];
    }
    case "remove": {
      return [body("product", "Product is required").exists()];
    }
    case "apply": {
      return [
        body("cart", "Cart is required").exists(),
        body("coupon", "Coupon is required").exists(),
      ];
    }
    case "cart": {
      return [body("cart", "Cart Id is required").exists()];
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
    const { customerId, guestId, deviceToken } = res.locals?.user;

    let query = {
      isDelete: false,
      isActive: true,
      isPurchased: false,
    };
    if (customerId) {
      query["customer"] = customerId;
    } else if (guestId) {
      query["guest"] = guestId;
    } else if (deviceToken) {
      query["deviceToken"] = deviceToken;
    }
    let errorResponses = [];
    let successResponses = [];
    let cartDetails = await service.getCart(query);
    const productDetails = await productsService.findOne({
      isActive: true,
      isDelete: false,
      slug: body?.product,
    });
    const isOrderQuantityValid =
      (productDetails?.stock >= body?.quantity &&
        productDetails?.maxOrderQuantity >= body?.quantity) ||
      false;
    if (isOrderQuantityValid) {
      if (cartDetails) {
        let products = cartDetails?.products || [];
        let isProductExists = products.some(
          (product) =>
            String(product?.product?._id) == String(productDetails?._id)
        );
        if (isProductExists) {
          const index = products.findIndex(
            (product) =>
              String(product?.product?._id) == String(productDetails?._id)
          );
          products[index].quantity = Number(body?.quantity);
        } else {
          products.unshift({
            product: productDetails?._id,
            quantity: body?.quantity,
          });
        }        
        const response = await service.updateCart(query, {
          products: products,
          isBuyNow: false,
        });
        if (response instanceof Error) {
          errorResponses.push(response);
        } else {
          successResponses.push(response);
        }
      } else {
        const response = await service.createCart({
          customer: customerId,
          guest: guestId,
          deviceToken: deviceToken,
          isBuyNow: false,
          products: [
            {
              product: productDetails?._id,
              quantity: body?.quantity,
            },
          ],
        });
        if (response instanceof Error) {
          errorResponses.push(response);
        } else {
          successResponses.push(response);
        }
      }

      if (errorResponses.length > 0) {
        helper.deliverResponse(res, 422, errorResponses, {
          error_code: messages.serverError.error_code,
          error_message: messages.serverError.error_message,
        });
      } else {
        helper.deliverResponse(res, 200, body, {
          error_code: messages.ADDED_TO_CART.error_code,
          error_message: messages.ADDED_TO_CART.error_message,
        });
      }
    } else {
      helper.deliverResponse(res, 200, body, {
        error_code: messages.LIMITED_STOCK.error_code,
        error_message: messages.LIMITED_STOCK.error_message,
      });
    }
  } catch (error) {
    console.log("Error caught in add to cart API :: " + error);
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

exports.getCartDetails = async (req, res) => {

  const { customerId, guestId, deviceToken } = res.locals?.user;
  const settings = await settingsService.findOne({});
  let { body } = req;
  let query = {
    isDelete: false,
    isActive: true,
    isPurchased: false,
  };
  if (customerId) {
    query["customer"] = customerId;
  } else if (guestId) {
    query["guest"] = guestId;
  } else if (deviceToken) {
    query["deviceToken"] = deviceToken;
  }  
 
  try {
    if (req.body.buynow === true) {
      query["isBuyNow"] = true;
      query["isPurchased"] = false;
    }
    
    console.log(query, "query");
    
    const cartDetails = await service.getCart(query);


    let products = [];
    let grandTotal = 0.0;
    let taxTotal = 0.0;
    let subTotal = 0.0;
    let discountTotal = 0.0;
    let wholeTotal = 0.0;
    let deliveryTotal = 0.0;
    let couponAmount = 0.0;3
    let giftWrapAmount = 0.0;

    if (!cartDetails) {
      helper.deliverResponse(res, 200, {
        cart: '',
        products: [],
        summary: null,
        appliedCoupon: null,
      }, {
        error_code: messages.EMPTY_CART.error_code,
        error_message: messages.EMPTY_CART.error_message,
      });
      return;
    }

    for (let product of cartDetails?.products) {
      const parentDetails = await productHeadModel
        .findOne({ _id: product?.product?.parentId })
        .populate("tax");
      const productResponse = getProductResponse(product?.product, settings);
      products.push({ ...productResponse, quantity: product?.quantity });
      
      let taxPercentage = 0;
      if (parentDetails?.tax) {
        const ruleDetails = await taxRulesModel.find({
          _id: { $in: parentDetails?.tax?.rules },
        });
        ruleDetails.forEach((rule) => (taxPercentage += rule?.rate));
      }
      const productTotal = product?.product?.price?.mrp * product?.quantity;
      const productSubTotal =
        (product?.product?.price?.selling * product?.quantity) / 1.05;
      const productTax = product?.product?.price?.selling * product?.quantity * 0.05;
      const productDiscount =
        product?.product?.price?.mrp - product?.product?.price?.selling;
      const totalProductDiscount = productDiscount * product?.quantity;
      grandTotal += productTotal;
      subTotal += productSubTotal - productTax;
      taxTotal += productTax;

      discountTotal += totalProductDiscount;
      wholeTotal += product?.product?.price?.selling * product?.quantity;
    }
    let appliedCoupon = { coupon: "", value: false };

    if (cartDetails?.coupon) {
      appliedCoupon = {
        coupon: cartDetails?.coupon?.code,
        value: true,
        amount: `${cartDetails?.coupon.type === "percent"
          ? `${cartDetails?.coupon.value}%`
          : `${settings?.currency} ${cartDetails?.coupon?.value}`
          } `,
      };
      // couponAmount=  // calcualte cart amount
      if (wholeTotal >= cartDetails?.coupon.minPurchase) {
        // patrial
        if (cartDetails?.coupon?.couponType === "partial") {
          const couponDetails = cartDetails?.coupon;
          const products = cartDetails?.products;
          let isCategoryPresent = products.some((product) =>
            product?.product?.category.some((categoryId) =>
              couponDetails?.categories?.includes(categoryId)
            )
          );
          const isProductPresent = products.some((product) => {
            return couponDetails?.products?.includes(product?.product?._id);
          });
          let collectionProductIds = [];
          if (cartDetails?.coupon?.collections) {
            collectionProductIds = cartDetails?.coupon?.collections.flatMap(
              (collection) => collection.products
            );
          }
          const isCollectionProductPresent = products.some((product) =>
            collectionProductIds.includes(product?.product?._id.toString())
          );
          // collection
          if (isCollectionProductPresent) {
            if (cartDetails?.coupon.type === "percent") {
              // Calculate percentage discount
              let totalSum = 0;
              products.map((product) => {
                if (collectionProductIds?.includes(product?.product?._id)) {
                  const totalPrice =
                    product?.product?.price?.selling * product?.quantity;
                  totalSum += totalPrice;
                }
              });
              let dicountedValue = totalSum * (couponDetails.value / 100);
              const updatedTotal = wholeTotal - dicountedValue;
              discountTotal += dicountedValue;
              wholeTotal = updatedTotal;
            } else if (cartDetails?.coupon.type === "amount") {
              // Directly subtract the coupon value
              let discountedValue = couponDetails.value || 0;
              discountedValue = Math.min(discountedValue, wholeTotal); // Ensure discount does not exceed the total
              const updatedTotal = wholeTotal - discountedValue;
              discountTotal += discountedValue;
              wholeTotal = updatedTotal;
            }
          }

          if (isCategoryPresent) {
            if (cartDetails?.coupon.type === "percent") {
              // Calculate percentage discount
              let totalSum = 0;
              let cs = products.map((product) => {
                if (
                  product?.product?.category.some((categoryId) =>
                    couponDetails?.categories?.includes(categoryId)
                  )
                ) {
                  const totalPrice =
                    product?.product?.price?.selling * product?.quantity;
                  totalSum += totalPrice;
                }
              });
              let dicountedValue = totalSum * (couponDetails.value / 100);
              const updatedTotal = wholeTotal - dicountedValue;
              discountTotal += dicountedValue;
              wholeTotal = updatedTotal;
            } else if (cartDetails?.coupon.type === "amount") {
              // Directly subtract the coupon value
              let totalSum = 0;
              let cs = products.map((product) => {
                if (
                  product?.product?.category.some((categoryId) =>
                    couponDetails?.categories?.includes(categoryId)
                  )
                ) {
                  const totalPrice =
                    product?.product?.price?.selling * product?.quantity;
                  totalSum += totalPrice;
                }
              });
              let dicountedValue = couponDetails.value || 0;
              const updatedTotal = wholeTotal - dicountedValue;
              discountTotal += Number(dicountedValue);
              wholeTotal = updatedTotal;
            }
          } else if (isProductPresent) {
            if (cartDetails?.coupon.type === "percent") {
              // Calculate percentage discount
              let totalSum = 0;
              products.map((product) => {
                if (couponDetails?.products?.includes(product?.product?._id)) {
                  const totalPrice =
                    product?.product?.price?.selling * product?.quantity;
                  totalSum += totalPrice;
                }
              });
              let dicountedValue = totalSum * (couponDetails.value / 100);
              const updatedTotal = wholeTotal - dicountedValue;
              discountTotal += dicountedValue;
              wholeTotal = updatedTotal;
            } else if (cartDetails?.coupon.type === "amount") {
              // Directly subtract the coupon value
              let totalSum = 0;
              let cs = products.map((product) => {
                if (
                  product?.product?.category.some((categoryId) =>
                    couponDetails?.categories?.includes(categoryId)
                  )
                ) {
                  const totalPrice =
                    product?.product?.price?.selling * product?.quantity;
                  totalSum += totalPrice;
                }
              });
              let dicountedValue = couponDetails.value || 0;
              const updatedTotal = wholeTotal - dicountedValue;
              discountTotal += Number(dicountedValue);
              wholeTotal = updatedTotal;
            }
          }
        } else {
          // complete
          if (cartDetails?.coupon.type === "percent") {
            // Calculate percentage discount
            couponAmount =
              (wholeTotal * Number(cartDetails?.coupon.value)) / 100;
          } else if (cartDetails?.coupon.type === "amount") {
            // Directly subtract the coupon value
            couponAmount = Number(cartDetails?.coupon.value);
          }

          // Ensure the couponAmount does not exceed the wholeTotal
          couponAmount = Math.min(couponAmount, wholeTotal);

          // Update totals
          discountTotal += couponAmount;
          wholeTotal -= couponAmount;
        }
      } else {
        couponAmount = 0; // Do not apply the coupon if minPurchase is not met
      }
    }

    // gift wrap
    const giftWrapDetails = await giftWrapService.findOne({ slug: 'gift-wrap' }, { _id: 0, __v: 0 })

    if (cartDetails?.giftWrap && giftWrapDetails?.isEnabled) {
      giftWrapAmount = cartDetails?.giftWrap?.giftCharge || 0.0;
      wholeTotal += giftWrapAmount;
    }
    let productShipmentItems=[]
    for (let product of cartDetails?.products) {
      let productPriceAfterDiscount = product?.product?.price?.selling;

      const isEligibleForDiscount =
        cartDetails?.coupon &&
        (cartDetails?.coupon?.couponType === "complete" ||
          cartDetails?.coupon?.products?.includes(product?.product?._id) ||
          product?.product?.category.some((categoryId) =>
            cartDetails?.coupon?.categories?.includes(categoryId)
          ));

          if (isEligibleForDiscount) {
            if (cartDetails?.coupon.type === "percent") {
              productPriceAfterDiscount -=
                (productPriceAfterDiscount * cartDetails?.coupon.value) / 100;
            } else if (cartDetails?.coupon.type === "amount") {
              // Get the total number of eligible products
              const eligibleProductsCount = cartDetails?.products.filter((p) =>
                cartDetails?.coupon?.products?.includes(p?.product?._id) ||
                p?.product?.category.some((categoryId) =>
                  cartDetails?.coupon?.categories?.includes(categoryId)
                )
              ).length;
        
              // Only divide among eligible products, not all
              productPriceAfterDiscount -= cartDetails?.coupon.value / eligibleProductsCount;
            }
          }
          productShipmentItems.push({
            weight: product?.product?.weight? (product?.product?.weight * product?.quantity) : (500 * product?.quantity),
            quantity: product?.quantity,
            dimensions: product?.product?.dimensions,
            total: productPriceAfterDiscount * product?.quantity,
          });
    }
    if( body?.countryCode){
     
      // const shippingdataResponse=await ShippingService.findOne({ refid: '1' })
      // console.log(shippingdataResponse,"shippingResponse");
      // const shippingResponse = await PostShippingService.calculateRates(
      // productShipmentItems,
      // cartDetails,
      // body?.state,
      // body?.countryCode
      // );
     
      // products.shippingValue = shippingResponse?.shippingAmount || 0;
      // console.log(  products.shippingValue,"shippingvalue" );
      // console.log(Number(shippingdataResponse.amount),"shipping response amount")
      // console.log(shippingResponse,"shippingresponse")
      // if (shippingdataResponse?.isActive === true) {
      //   console.log("it is   true")
      //   if (Number(wholeTotal) > Number(shippingdataResponse.amount)) {
      //     console.log("yes")
      //     deliveryTotal = Number(shippingdataResponse?.charge);
      //   }
      // } else {
      //   console.log("no")
      //   deliveryTotal += shippingResponse?.shippingAmount ;
      // }
      
      // await service.updateCart(query, {
      //   shippingValue: shippingResponse?.shippingAmount ,
      // });
      const shippingdataResponse = await ShippingService.findOne({ refid: '1' });
console.log(shippingdataResponse, "shippingdataResponse");

const shippingResponse = await PostShippingService.calculateRates(
  productShipmentItems,
  cartDetails,
  body?.state,
  body?.countryCode
);

console.log(shippingResponse, "Shipping Response");

// Check if DepartureLocation is Dubai
const isFromDubai = shippingResponse?.log?.request?.ArrivalCountryCode === 'AE';
let calculatedShippingAmount = shippingResponse?.shippingAmount || 0;
 
products.shippingValue = calculatedShippingAmount;
console.log(products.shippingValue, "Calculated Shipping Value");
console.log(Number(shippingdataResponse.amount), "Shipping Rule Amount");
console.log(isFromDubai, "isFromDubai");
console.log(Number(wholeTotal), "Whole Total");
if (isFromDubai) {
  console.log("Shipment is from Dubai");

  if (shippingdataResponse?.isActive === true) {
    console.log("Shipping rule is active");

    if (Number(wholeTotal) > Number(shippingdataResponse.amount)) {
      console.log("Whole total is greater than rule amount");
      deliveryTotal = Number(shippingdataResponse.charge);
    } else {
      console.log("Whole total is less or equal, using calculated shipping");
      deliveryTotal = calculatedShippingAmount;
    }

  } else {
    console.log("Shipping rule is not active, using calculated shipping");
    deliveryTotal = calculatedShippingAmount;
  }
  await service.updateCart(query, {
    shippingValue: deliveryTotal,
  });
} else {
  console.log("Not from Dubai — no special rule applied, using calculated shipping");
  deliveryTotal = calculatedShippingAmount;
  await service.updateCart(query, {
    shippingValue: deliveryTotal,
  });
}

// Update shipping value in cart


     
}

// query.shippingValue=shippingResponse?.shippingAmount||0
    // Explicitly update cart in MongoDB to save new shippingValue
   
    // query.shippingValue = query?.shippingAmount;
    const response = await service.updateCart(query, {
      products: cartDetails.products,
      
    });

    if(Number(deliveryTotal)>0){
      wholeTotal=Number(wholeTotal)+Number(deliveryTotal)
    }
let shippingNote=""
if(cartDetails?.shippingnote==null){
  shippingNote=""
}
else{
  shippingNote=cartDetails?.shippingnote?.note
}
console.log(cartDetails?.shippingnote,"shippingnote")
    let summary = {
      total: { text: `${settings?.currency} ${grandTotal.toFixed(2)}` },
      tax: { text: `${settings?.currency} ${taxTotal.toFixed(2)}` },
      discount: { text: `${settings?.currency} ${discountTotal.toFixed(2)}` },
      deliveryFee: {
        text: `${settings?.currency} ${deliveryTotal?.toFixed(2)}`,
      },
      subtotal: { text: `${settings?.currency} ${subTotal.toFixed(2)}` },
      wholeTotal: { text: `${settings?.currency} ${wholeTotal.toFixed(2)}` },
      giftWrap: { text: `${settings?.currency} ${giftWrapAmount.toFixed(2)}`, enabled: cartDetails?.giftWrap ? true : false },
      deliveryNote: { text: `${shippingNote}`, _id: `${cartDetails?.shippingnote?._id || null}` }
    };

    helper.deliverResponse(
      res,
      200,
      {
        cart: cartDetails._id,
        products: products,
        summary: summary,
        appliedCoupon: appliedCoupon,
      },
      {
        error_code: messages.successResponse.error_code,
        error_message: messages.successResponse.error_message,
      }
    );
  } catch (error) {
    console.log("Error caught in get cart details API :: " + error);
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

exports.removeFromCart = async (req, res) => {
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
   
    const { customerId, guestId, deviceToken } = res.locals?.user;
   
    let query = {
      isDelete: false,
      isActive: true,
      isPurchased: false,
    };
    if (customerId) {
      query["customer"] = customerId;
    } else if (guestId) {
      query["guest"] = guestId;
    } else if (deviceToken) {
      query["deviceToken"] = deviceToken;
    }
  
    let cartDetails = await service.getCart(query);

   
    const productDetails = await productsService.findOne({
      isActive: true,
      isDelete: false,
      slug: body?.product,
    });

    if (cartDetails) {
      let products = cartDetails?.products || [];
      const isProductExists = products.some(
       
        (product) =>
          String(product?.product?._id) == String(productDetails?._id)
     
      );
      // console.log("products",products),
     
   
      if (isProductExists) {
        products = products.filter(
          (product) =>
            String(product?.product?._id) != String(productDetails?._id)
        );
        const response = await service.updateCart(query, {
          products: products,
        });
        if (response instanceof Error) {
          helper.deliverResponse(res, 422, response, {
            error_code: messages.serverError.error_code,
            error_message: messages.serverError.error_message,
          });
        } else {
          helper.deliverResponse(res, 200, body, {
            error_code: messages.REMOVED_FROM_CART.error_code,
            error_message: messages.REMOVED_FROM_CART.error_message,
          });
        }
      } else {
        helper.deliverResponse(
          res,
          200,
          {},
          {
            error_code: messages.PRODUCT_NOT_FOUND.error_code,
            error_message: messages.PRODUCT_NOT_FOUND.error_message,
          }
        );
      }
    } else {
      helper.deliverResponse(
        res,
        200,
        {},
        {
          error_code: messages.CART_NOT_FOUND.error_code,
          error_message: messages.CART_NOT_FOUND.error_message,
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

exports.clearCart = async (req, res) => {
  try {
    const { customerId, guestId, deviceToken } = res.locals?.user;
    let query = {
      isDelete: false,
      isActive: true,
      isPurchased: false,
    };
    if (customerId) {
      query["customer"] = customerId;
    } else if (guestId) {
      query["guest"] = guestId;
    } else if (deviceToken) {
      query["deviceToken"] = deviceToken;
    }
    let cartDetails = await service.getCart(query);
    if (cartDetails) {
      const response = await service.updateCart(query, { products: [] });
      if (response instanceof Error) {
        helper.deliverResponse(res, 422, response, {
          error_code: messages.serverError.error_code,
          error_message: messages.serverError.error_message,
        });
      } else {
        helper.deliverResponse(
          res,
          200,
          {},
          {
            error_code: messages.CART_CLEARED.error_code,
            error_message: messages.CART_CLEARED.error_message,
          }
        );
      }
    } else {
      helper.deliverResponse(
        res,
        200,
        {},
        {
          error_code: messages.CART_NOT_FOUND.error_code,
          error_message: messages.CART_NOT_FOUND.error_message,
        }
      );
    }
  } catch (error) {
    console.log("Error caught in clear cart API :: " + error);
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

exports.applyCouponCheck = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      helper.deliverResponse(res, 422, errors, {
        error_code: messages.VALIDATION_ERROR.error_code,
        error_message: messages.VALIDATION_ERROR.error_message,
      });
      return;
    }

    const { userid, deviceToken } = res?.locals?.user;
    
    let { body } = req;
    const cart = await service.getCart({
      cartid: body?.cart,
      isDelete: false,
      isActive: true,
    });
    let couponDetails = await couponService.getCouponDetails({
      code: body?.coupon,
      isActive: true,
      isDelete: false,
    });
    let isApplicable = true;
    let coupons = [];
    deviceToken == cart?.deviceToken
      ? (isApplicable = true)
      : (isApplicable = false);

    if (!cart?.deviceToken) {
      const customerDetails = await customerService.getCustomer({
        _id: cart?.customer?.id,
        isDelete: false,
      });
      coupons = [...customerDetails?.coupons];
    } else if (cart?.deviceToken) {
      const guestDetails = await guestService.getGuestDetails({
        deviceToken: cart?.deviceToken,
        isDelete: false,
      });
      coupons = [...guestDetails?.coupons];
    }

    if (couponDetails?.countPerUser) {
      let count = 0;
      if (coupons.length > 0)
        for (let coupon of coupons)
          String(coupon) == String(couponDetails?._id) ? count++ : null;
      count < Number(couponDetails?.countPerUser)
        ? (isApplicable = true)
        : (isApplicable = false);
    }

    if (couponDetails) {
      if (isApplicable) {
        if (cart) {
          if (!cart?.coupon) {
            let total = 0;
            let data = {};
            switch (couponDetails?.type) {
              case "percent":
                total =
                  Number(cartTotal) -
                  (Number(cartTotal) * Number(couponDetails?.value)) / 100;
                data = {
                  coupon: couponDetails?._id,
                  discountTotal: (
                    (Number(cartTotal) * Number(couponDetails?.value)) /
                    100
                  ).toFixed(2),
                  total: total.toFixed(2),
                };
                break;
              case "amount":
                total = Number(cartTotal) - Number(couponDetails?.value);
                data = {
                  coupon: couponDetails?._id,
                  discountTotal: Number(couponDetails?.value).toFixed(2),
                  total: total.toFixed(2),
                };
                break;
            }

            if (Number(cartTotal) > couponDetails?.minPurchase) {
              if (couponDetails?.details?.type == "limited") {
                couponDetails?.details?.type == "limited"
                  ? Number(couponDetails?.details?.value) > 1
                    ? await service.manageCoupon(body?.cart, data)
                    : null
                  : await service.manageCoupon(body?.cart, data);
                const cartDetails = await service.getCart({
                  cartid: body?.cart,
                  isDelete: false,
                  isActive: true,
                });
                if (!cartDetails?.deviceToken && cartDetails?.coupon) {
                  const customerDetails = await customerService.getCustomer({
                    _id: cart?.customer?.id,
                    isDelete: false,
                  });
                  if (customerDetails) {
                    await customerService.update(
                      { _id: cart?.customer?.id, isDelete: false },
                      {
                        $set: {
                          coupons: [
                            ...customerDetails?.coupons,
                            couponDetails?._id,
                          ],
                        },
                      }
                    );
                  }
                } else if (cartDetails?.deviceToken && cartDetails?.coupon) {
                  const guestDetails = await guestService.getGuestDetails({
                    deviceToken: cart?.deviceToken,
                    isDelete: false,
                  });
                  await guestService.updateGuest(
                    { deviceToken: cart?.deviceToken, isDelete: false },
                    { coupons: [...guestDetails?.coupons, couponDetails?._id] }
                  );
                }
              }
              helper.deliverResponse(
                res,
                200,
                {},
                {
                  error_code: messages.COUPON_APPLIED.error_code,
                  error_message: messages.COUPON_APPLIED.error_message,
                }
              );
            } else {
              helper.deliverResponse(
                res,
                200,
                {},
                {
                  error_code: 1,
                  error_message: `Add ${settings?.currency} ${Number(couponDetails?.minPurchase) - Number(cartTotal)
                    } more to avail this offer`,
                }
              );
            }
          } else {
            helper.deliverResponse(
              res,
              200,
              {},
              {
                error_code: messages.COUPON_EXISTS.error_code,
                error_message: messages.COUPON_EXISTS.error_message,
              }
            );
          }
        } else {
          helper.deliverResponse(
            res,
            200,
            {},
            {
              error_code: messages.CART_NOT_FOUND.error_code,
              error_message: messages.CART_NOT_FOUND.error_message,
            }
          );
        }
      } else {
        helper.deliverResponse(
          res,
          200,
          {},
          {
            error_code: messages.CANNOT_APPLY_COUPON.error_code,
            error_message: messages.CANNOT_APPLY_COUPON.error_message,
          }
        );
      }
    } else {
      helper.deliverResponse(
        res,
        200,
        {},
        {
          error_code: messages.COUPON_NOT_FOUND.error_code,
          error_message: messages.COUPON_NOT_FOUND.error_message,
        }
      );
    }
  } catch (error) {
    console.log("Error caught while applying coupon :: " + error);
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

    const { userid, deviceToken } = res?.locals?.user;
    let { body } = req;
    const userDetails = await customerService.getCustomer({ userid: userid });
    const cart = await service.getCart({
      _id: body?.cart,
      isDelete: false,
      isActive: true,
    });
    let couponDetails = await couponService.getCouponDetailsWithProducts({
      code: body?.coupon,
      isActive: true,
      isDelete: false,
    });
    let coupons = [];
    let cartTotal = 0;

    if (couponDetails) {
      if (!cart?.deviceToken) {
        const customerDetails = await customerService.getCustomer({
          _id: cart?.customer?.id,
          isDelete: false,
        });
        coupons = [...customerDetails?.coupons];
      } else if (cart?.deviceToken) {
        const guestDetails = await guestService.getGuestDetails({
          deviceToken: cart?.deviceToken,
          isDelete: false,
        });
        coupons = [...guestDetails?.coupons];
      }

      switch (couponDetails?.couponType) {
        case "complete":
          if (
            userid &&
            String(userDetails?._id) == String(cart?.customer?._id)
          ) {
            if (!coupons.includes(couponDetails?._id)) {
              let total = 0;
              let discount = 0;
              cart?.coupon
                ? (total = Number(cartTotal) + Number(cart?.discountTotal))
                : (total = Number(cartTotal));
              if (couponDetails?.type == "percent") {
                const percentageOff = Number(couponDetails?.value) / 100;
                const discountOff = total * percentageOff;
                total = total - discountOff;
                discount = discountOff;
                total = total.toFixed(2);
                discount = discount.toFixed(2);
              } else if (couponDetails?.type == "amount") {
                total = total - Number(couponDetails?.value).toFixed(2);
                discount = Number(couponDetails?.value).toFixed(2);
              }

              coupons.push(couponDetails?._id);
              let cartPayload = {
                total: total,
                discountTotal: discount,
                coupon: couponDetails?._id,
              };

              const cartDetails = await service.updateCart(
                { _id: body?.cart },
                cartPayload
              );
              if (cartDetails instanceof Error) {
                helper.deliverResponse(
                  res,
                  200,
                  {},
                  {
                    error_code: messages.CANNOT_APPLY_COUPON.error_code,
                    error_message: messages.CANNOT_APPLY_COUPON.error_message,
                  }
                );
              } else {
                await customerService.update(
                  { userid: userid },
                  { $set: { coupons: coupons } }
                );
                helper.deliverResponse(
                  res,
                  200,
                  {},
                  {
                    error_code: messages.COUPON_APPLIED.error_code,
                    error_message: messages.COUPON_APPLIED.error_message,
                  }
                );
              }
            } else {
              helper.deliverResponse(
                res,
                200,
                {},
                {
                  error_code: messages.CANNOT_APPLY_COUPON.error_code,
                  error_message: messages.CANNOT_APPLY_COUPON.error_message,
                }
              );
            }
          } else {
            helper.deliverResponse(
              res,
              200,
              {},
              {
                error_code: messages.CANNOT_PROCEED_COUPON.error_code,
                error_message: messages.CANNOT_PROCEED_COUPON.error_message,
              }
            );
          }
          break;
        case "partial":
          if (
            userid &&
            String(userDetails?._id) == String(cart?.customer?._id)
          ) {
            if (!coupons.includes(couponDetails?._id)) {
              let total = 0;
              let discount = 0;
              cart?.coupon
                ? (total = Number(cartTotal) + Number(cart?.discountTotal))
                : (total = Number(cartTotal));
              if (couponDetails?.type == "percent") {
                const percentageOff = Number(couponDetails?.value) / 100;
                const discountOff = total * percentageOff;
                total = total - discountOff;
                discount = discountOff;
                total = total.toFixed(2);
                discount = discount.toFixed(2);
              } else if (couponDetails?.type == "amount") {
                total = total - Number(couponDetails?.value).toFixed(2);
                discount = Number(couponDetails?.value).toFixed(2);
              }

              coupons.push(couponDetails?._id);
              let cartPayload = {
                // total: total,
                // discountTotal: discount,
                coupon: couponDetails?._id,
              };

              const cartDetails = await service.updateCart(
                { _id: body?.cart },
                cartPayload
              );
              if (cartDetails instanceof Error) {
                helper.deliverResponse(
                  res,
                  200,
                  {},
                  {
                    error_code: messages.CANNOT_APPLY_COUPON.error_code,
                    error_message: messages.CANNOT_APPLY_COUPON.error_message,
                  }
                );
              } else {
                await customerService.update(
                  { userid: userid },
                  { $set: { coupons: coupons } }
                );
                helper.deliverResponse(
                  res,
                  200,
                  {},
                  {
                    error_code: messages.COUPON_APPLIED.error_code,
                    error_message: messages.COUPON_APPLIED.error_message,
                  }
                );
              }
            } else {
              helper.deliverResponse(
                res,
                200,
                {},
                {
                  error_code: messages.CANNOT_APPLY_COUPON.error_code,
                  error_message: messages.CANNOT_APPLY_COUPON.error_message,
                }
              );
            }
          } else {
            helper.deliverResponse(
              res,
              200,
              {},
              {
                error_code: messages.CANNOT_PROCEED_COUPON.error_code,
                error_message: messages.CANNOT_PROCEED_COUPON.error_message,
              }
            );
          }
          break;
      }
    } else {
      helper.deliverResponse(
        res,
        200,
        {},
        {
          error_code: messages.COUPON_NOT_FOUND.error_code,
          error_message: messages.COUPON_NOT_FOUND.error_message,
        }
      );
    }
  } catch (error) {
    console.log("Error caught while applying coupon :: " + error);
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

exports.appyGiftWrap = async (req, res) => {
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
    let giftWrapDetails = await giftWrapService.findOne({
      slug: "gift-wrap",
      isEnabled: true,
    })

    if (giftWrapDetails) {
      const cartDetails = await service.updateCart(
        { _id: body?.cart },
        { giftWrap: giftWrapDetails?._id }
      );
      if (cartDetails instanceof Error) {
        helper.deliverResponse(
          res,
          200,
          {},
          {
            error_code: messages.serverError.error_code,
            error_message: messages.serverError.error_message,
          }
        );
      } else {
        helper.deliverResponse(
          res,
          200,
          {},
          {
            error_code: messages.successResponse.error_code,
            error_message: messages.successResponse.error_message,
          }
        );
      }
    }
  } catch (error) {
    console.log("Error caught while applying gift wrap :: " + error);
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

exports.removeGiftWrap = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      helper.deliverResponse(res, 422, errors, {
        error_code: messages.VALIDATION_ERROR.error_code,
        error_message: messages.VALIDATION_ERROR.error_message,
      });
      return;
    }

    const cart = await service.getCart({
      _id: req.body?.cart,
      isDelete: false,
      isActive: true,
    });

    if (cart) {
      const cartDetails = await service.updateCart(
        { _id: req.body?.cart },
        { giftWrap: null }
      );
      if (cartDetails instanceof Error) {
        helper.deliverResponse(
          res,
          200,
          {},
          {
            error_code: messages.serverError.error_code,
            error_message: messages.serverError.error_message,
          }
        );
      } else {
        helper.deliverResponse(
          res,
          200,
          {},
          {
            error_code: messages.successResponse.error_code,
            error_message: messages.successResponse.error_message,
          }
        );
      }
    }
  } catch (error) {
    console.log("Error caught while removing gift wrap :: " + error);
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
//the   delivery  note
exports.updateDeliveyNote = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return helper.deliverResponse(res, 422, {}, {
        error_code: messages.VALIDATION_ERROR.error_code,
        error_message: messages.VALIDATION_ERROR.error_message,
      });
    }

    let { body } = req;

    // Check if a delivery note exists
    let deliveryNoteDetails = await shippingNoteService.findOne({
      note: body.instruction
     });
console.log(body,"deliverynotedetails")
    if (!deliveryNoteDetails) {
      return helper.deliverResponse(res, 422, {}, {
        error_code: messages.notFound.error_code,
        error_message: "Delivery note not found",
      });
    }

    // Update cart with the delivery note ID
    const cartDetails = await service.updateCart(
      { _id: body?.cartId },
      { deliveryNote: deliveryNoteDetails._id }
    );


    if (!cartDetails) {
      return helper.deliverResponse(res, 422, {}, {
        error_code: messages.serverError.error_code,
        error_message: "Failed to update cart",
      });
    }

    return helper.deliverResponse(res, 200, {}, {
      error_code: messages.successResponse.error_code,
      error_message: "Delivery note added successfully",
    });

  } catch (error) {
    console.error("Error caught while adding delivery note:", error);
    return helper.deliverResponse(res, 422, {}, {
      error_code: messages.serverError.error_code,
      error_message: "Internal server error",
    });
  }
};


exports.removeDeliveryNote = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return helper.deliverResponse(res, 422, {}, {
        error_code: messages.VALIDATION_ERROR.error_code,
        error_message: messages.VALIDATION_ERROR.error_message,
      });
    }

    const { cartId   } = req.body;

    // Check if cart exists and is active
    const cartDetails = await service.getCart({
      _id: cartId,
      isDelete: false,
      isActive: true,
    });
console.log(cartDetails,"cartDetails")
    if (!cartDetails) {
      return helper.deliverResponse(res, 404, {}, {
        error_code: messages.notFound.error_code,
        error_message: "Cart not found or inactive",
      });
    }

    // Ensure the cart has the given delivery note
    if (!cartDetails.shippingnote?.note) {
      return helper.deliverResponse(res, 400, {}, {
        error_code: messages.VALIDATION_ERROR.error_code,
        error_message: "Delivery note does not exist in this cart",
      });
    }

    // Remove the specific delivery note
    const cart = await service.getCartByCartId(cartId); // Or however you fetch a cart

    if (cart && cart.shippingnote) {
      const shippingNoteId = cart.shippingnote;

    
      // 2. Update the shipping note document to set isEnabled to false
           const shippingNoteUpdateResponse = await shippingNoteService.update(
        { _id: shippingNoteId?._id },
        { isEnabled: false }
      );

      // // 3. Remove the reference to shippingnote from the cart
      // const updatedCart = await service.updateCart(
      //   { _id: cartId },
      //   { $unset: { shippingnote: "" } }
      // );
    
      // console.log(updatedCart, "updatedCart");
    } else {
      console.log("No shippingnote associated with this cart.");
    }

    if (!cart) {
      return helper.deliverResponse(res, 500, {}, {
        error_code: messages.serverError.error_code,
        error_message: "Failed to remove delivery note",
      });
    }

    return helper.deliverResponse(res, 200, {}, {
      error_code: messages.successResponse.error_code,
      error_message: "Delivery note removed successfully",
    });

  } catch (error) {
    console.error("Error caught while removing delivery note:", error);
    return helper.deliverResponse(res, 500, {}, {
      error_code: messages.serverError.error_code,
      error_message: "Internal server error",
    });
  }
};


//end  ogf tthe code

exports.removeCoupon = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      helper.deliverResponse(res, 422, errors, {
        error_code: messages.VALIDATION_ERROR.error_code,
        error_message: messages.VALIDATION_ERROR.error_message,
      });
      return;
    }
    let cartTotal;
    const { body } = req;
    const cart = await service.getCart({
      _id: body?.cart,
      isDelete: false,
      isActive: true,
    });
    let data = {
      total: (Number(cartTotal) + Number(cart?.discountTotal)).toFixed(2),
      coupon: null,
      discountTotal: "0.00",
    };

    const cartDetails = await service.manageCoupon(body?.cart, data);
    if (cartDetails instanceof Error) {
      helper.deliverResponse(
        res,
        200,
        {},
        {
          error_code: messages.serverError.error_code,
          error_message: messages.serverError.error_message,
        }
      );
    } else {
      let cartPayload = {
        coupon: null,
      };

      const cartDetails = await service.updateCart(
        { _id: body?.cart },
        cartPayload
      );
      if (!cart?.deviceToken) {
        const customerDetails = await customerService.getCustomer({
          _id: cart?.customer?.id,
          isDelete: false,
        });
        let coupons = [...customerDetails?.coupons];
        coupons = coupons.filter(
          (coupon) => String(coupon) != String(cart?.coupon?._id)
        );
        if (customerDetails) {
          await customerService.update(
            { _id: cart?.customer?.id, isDelete: false },
            { $set: { coupons: coupons } }
          );
        }
      } else {
        const guestDetails = await guestService.getGuestDetails({
          deviceToken: cart?.deviceToken,
          isDelete: false,
        });
        let coupons = [...guestDetails?.coupons];
        coupons = coupons.filter(
          (coupon) => String(coupon) != String(cart?.coupon?._id)
        );
        if (guestDetails) {
          await guestService.updateGuest(
            { deviceToken: cart?.deviceToken, isDelete: false },
            { coupons: coupons }
          );
        }
      }

      helper.deliverResponse(
        res,
        200,
        {},
        {
          error_code: messages.COUPON_REMOVED.error_code,
          error_message: messages.COUPON_REMOVED.error_message,
        }
      );
    }
  } catch (error) {
    console.log("Error caught while removing coupon :: " + error);
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

exports.getCoupons = async (req, res, next) => {
  try {
    const { userid, deviceToken } = res.locals?.user;

    let customerDetails = null;
    let cart = {};
    let response = { availableCoupons: [] };
    console.log("started fetching settings service");
    const settings = await settingsService.findOne({});

    console.log("started fetching customer details");
    if (userid) {
      isGuest = false;
      customerDetails = await customerService.getCustomer({
        userid: userid,
        isActive: true,
        isDelete: false,
      });
      cart = await service.getCart({
        customer: customerDetails?._id,
        isDelete: false,
        isActive: true,
        isPurchased: false,
      });
    } else if (deviceToken) {
      isGuest = true;
      cart = await service.getCart({
        deviceToken: deviceToken,
        isDelete: false,
        isActive: true,
        isPurchased: false,
      });
    }
    if (customerDetails && cart) {
      let couponData = await getApplicableCoupons(cart, customerDetails);
      response.availableCoupons = couponData || [];
    }

    helper.deliverResponse(res, 200, response, {
      error_code: messages.successResponse.error_code,
      error_message: messages.successResponse.error_message,
    });
  } catch (error) {
    console.log("Error caught while get coupons API :: " + error);
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

exports.getCount = async (req, res) => {
  try {
    const userid = res.locals?.user?.userid;
    let { country, state, city } = req.query;
    const deviceToken = res.locals?.user?.deviceToken;

    let count = 0;
    let wishlistCount = 0;
    let customerDetails = {};
    let cartDetails = {};
    if (userid) {
      customerDetails = await customerService.getCustomer({
        userid: userid,
        isActive: true,
        isDelete: false,
      });

      cartDetails = await service.getCart({
        isDelete: false,
        isActive: true,
        customer: customerDetails?._id,
        isPurchased: false,
      });
    } else if (deviceToken) {
      cartDetails = await service.getCart({
        isDelete: false,
        isActive: true,
        deviceToken: deviceToken,
        isPurchased: false,
      });
    }

    //additional fields for cart amount calculation
    let ids =
      cartDetails?.products?.map((item) => item?.product?.product?._id) || [];

    let addOnProductsObject = await service.getAddonProducts(ids);
    const giftWrapDetails = await giftWrapService.findOne({
      slug: "gift-wrap",
    });
    const settings = await settingsService.findOne({ refid: "1" });

    if (customerDetails) wishlistCount = customerDetails?.wishlist?.length;
    if (cartDetails) count = cartDetails?.products?.length;

    //calculating total amount
    let total = 0;
    let shippingCost = "0";
    if (cartDetails && customerDetails && cartDetails?.products?.length > 0) {
      let charges = [];
      let cartData = await getCartSummary(
        cartDetails,
        addOnProductsObject,
        productsService,
        customerDetails,
        giftWrapDetails,
        settings,
        BASE_URL
      );
      let t = cartData?.cartTotal || 0;
      charges = cartData?.charges || [];
      //shipping charge calculation
      let totalWithshippingCharge = await shipping.calculation(
        charges,
        t,
        country,
        state,
        city
      );
      console.log(totalWithshippingCharge.shippingCharge,"the shipping charge ")
      if (Number(totalWithshippingCharge.shippingCharge) > 0) {
        total = totalWithshippingCharge.amount;
        shippingCost = totalWithshippingCharge.shippingCharge.toFixed(2);
      } else {
        total = cartData?.cartTotal || 0;
      }
    }
    //applying coupon
    if (cartDetails?.coupon) {
      const coupon = await couponService.getCouponDetails({
        code: cartDetails?.coupon?.code,
      });
      let result = await applyCoupon(
        total,
        cartDetails?.coupon?.code,
        cartDetails?.products,
        coupon,
        customerDetails
      );
      total = result?.cartTotal;
    }

    let response = {
      counts: {
        cart: count,
        wishlist: wishlistCount,
        total: settings?.currency + " " + total.toFixed(2),
      },
    };

    helper.deliverResponse(res, 200, response, {
      error_code: messages.successResponse.error_code,
      error_message: messages.successResponse.error_message,
    });
  } catch (error) {
    console.log("Error caught in counts API :: " + error);
    helper.deliverResponse(res, 422, error, {
      error_code: messages.serverError.error_code,
      error_message: messages.serverError.error_message,
    });
  }
};
