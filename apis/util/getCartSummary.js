const { getProductResponse } = require("./productResponse");
const productService = require("./../app/services/product.service");

async function getCartSummary(
  cartDetails,
  productsService,
  settings,
  route = ""
) {
  try {
    let cartWholeTotal = 0.0;
    let cartSubTotal = 0.0;
    let cartTaxTotal = 0.0;
    let cartTotal = 0.0;
    let cartDiscountTotal = 0.0;
    let couponAmount = 0.0;
    let cartGiftWrapTotal = 0.0;
    let shipingChargeTotal = 0.0
    let products = [];

    const productIds =
      cartDetails &&
      cartDetails?.products.map((product) => product?.product?._id);
    const allProductDetails = await productService.find(
      { _id: { $in: productIds } },
      {}
    );
    // Create a map for easy access to product details
  
    const productDetailsMap = {};
    allProductDetails.forEach((productDetails) => {
      productDetailsMap[productDetails._id] = productDetails;
    });
    for (let product of cartDetails?.products) {
      const productDetails = productDetailsMap[product?.product?._id];
      if (productDetails) {
        let productPrice = productDetails?.price?.mrp * product?.quantity;
        let productSellingPrice =
          productDetails?.price?.selling * product?.quantity;
        let taxTotal = 0.0;
        let subTotal = productPrice;
        const taxDetails = productDetails?.product?.tax;


        // if (taxDetails?.name == "VAT") {
          subTotal = productSellingPrice / 1.05;
          taxTotal = productSellingPrice - subTotal;
        // }
       
        productDetails?.price?.mrp == productDetails?.price?.selling
          ? (cartDiscountTotal += 0)
          : (cartDiscountTotal +=
              (productDetails?.price?.mrp - productDetails?.price?.selling) *
              product?.quantity);

        cartSubTotal += subTotal;
        cartWholeTotal += productDetails?.price?.selling * product?.quantity;
    
        cartTaxTotal += taxTotal;
        console.log(cartTaxTotal,"carttax  trorwebrw")
        cartTotal += productPrice;


        switch (route) {
          case "checkout":
            products.push({
              productId: productDetails?._id,
              pricePerUnit: productDetails?.price?.selling,
              quantity: product?.quantity,
              baseTotal: Number(subTotal.toFixed(2)),
              taxTotal: Number(taxTotal.toFixed(2)),
              total: Number(productSellingPrice.toFixed(2)),
              history: [{ status: "PLACED", date: new Date().toISOString() }],
            });
            break;
          default:
            const cartDetails = getProductResponse(productDetails, settings);
            products.push(cartDetails);
        }
      }
    }
    
    if (cartDetails?.coupon) {
      if (cartWholeTotal >= cartDetails?.coupon.minPurchase) {
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
              const updatedTotal = cartWholeTotal - dicountedValue;
              cartDiscountTotal += dicountedValue;
              cartWholeTotal = updatedTotal;
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
              const updatedTotal = cartWholeTotal - dicountedValue;
              cartDiscountTotal += Number(dicountedValue);
              cartWholeTotal = updatedTotal;
            }
          } else if (isProductPresent) {
            if (cartDetails?.coupon.type === "percent") {
              // Calculate percentage discount
              let totalSum = 0;
              products.map((product) => {
                if (couponDetails?.products?.includes(product?.product?._id)) {
                  const totalPrice = product?.product?.price?.selling * product?.quantity;
                  totalSum += totalPrice;
                } 
              });
              let dicountedValue = totalSum * (couponDetails.value / 100); 
              const updatedTotal = cartWholeTotal - dicountedValue;
              cartDiscountTotal += dicountedValue;
              cartWholeTotal = updatedTotal;
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
              const updatedTotal = cartWholeTotal - dicountedValue;
              cartDiscountTotal += Number(dicountedValue);
              cartWholeTotal = updatedTotal;
            }
          }
        } else {
          if (cartDetails?.coupon.type === "percent") {
            // Calculate percentage discount
            couponAmount =
              (cartWholeTotal * Number(cartDetails?.coupon.value)) / 100;
          } else if (cartDetails?.coupon.type === "amount") {
            // Directly subtract the coupon value
            couponAmount = Number(cartDetails?.coupon.value);
          }
          // Ensure the couponAmount does not exceed the wholeTotal
          couponAmount = Math.min(couponAmount, cartWholeTotal);

          // Update totals
          cartDiscountTotal += couponAmount;
          cartWholeTotal -= couponAmount;
        }
      } else {
        couponAmount = 0; // Do not apply the coupon if minPurchase is not met
      }
    }

    if (cartDetails?.giftWrap) {
      cartGiftWrapTotal = cartDetails?.giftWrap?.giftCharge;
      cartWholeTotal += cartDetails?.giftWrap?.giftCharge;
    }
    shipingChargeTotal=cartDetails?.shippingValue
    if(shipingChargeTotal>0){
      cartWholeTotal +=shipingChargeTotal
    }
  
    // COMMENTED BECAUSE VAT IS ALREADY INCLUSIVE IN THE PRICE OF THE PRODUCTS
    // if(cartTaxTotal>0){
    //   cartWholeTotal+=cartTaxTotal
    // }

    let result = {
      cartSubTotal,
      cartTaxTotal,
      cartTotal,
      cartWholeTotal,
      cartDiscountTotal,
      cartGiftWrapTotal,
      shipingChargeTotal,
      products,
    };
    return result;
  } catch (error) {
    console.log("error caught in getCartSummary.js utility function" + error);
  }
}

module.exports = {
  getCartSummary,
};
