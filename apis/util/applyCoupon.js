const couponService = require("../app/services/coupon.service");
const { getCollectionsByProductId } = require("./getCollections");
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

async function applyCoupon(cartTotal, couponCode, products, coupon, customerDetails) {
    try {
        let result = { couponApplied: false }
        if (!coupon && couponCode) {
            coupon = await couponService.getCouponDetails({ code: couponCode });
        }

        if (!coupon || coupon.isDelete || !coupon.isVisibility) {
            console.log("Coupon not valid or inactive. Original cart total:", cartTotal);
            result.cartTotal = cartTotal;
            result.message = "Coupon is not valid"
            result.couponApplied = false
            return result;
        }

        if (coupon?.details?.type == "limited" && Number(coupon?.details?.value) <= 0) {
            result.cartTotal = cartTotal;
            result.message = "Sorry, this coupon has already been used the maximum number of times."
            result.couponApplied = false
            return result;
        }

        if (!customerDetails) {
            result.cartTotal = cartTotal;
            result.message = "sorry , you are not allowed to use this coupon at this time"
            result.couponApplied = false
            return result;
        }

        let couponUsageCount = customerDetails?.coupons?.filter(c => c == coupon?._id).length;

        if (couponUsageCount >= coupon?.countPerUser) {
            result.cartTotal = cartTotal;
            result.message = "Sorry, this coupon has already been used the maximum number of times."
            result.couponApplied = false
            return result;
        }

        const currentDate = new Date();
        if (coupon.lastDate < currentDate || coupon.fromDate > currentDate) {
            result.cartTotal = cartTotal;
            result.couponApplied = false;
            result.message = "Coupon has expired."
            return result;
        }

        if (cartTotal < coupon?.minPurchase) {
            result.cartTotal = cartTotal;
            result.message = "Minimum purchase amount not met."
            result.couponApplied = false;
            return result;
        }

        if (coupon?.couponType === 'partial') {
            let isCategoryPresent = products.some(product =>
                product?.product?.category?.id.some(categoryId => coupon?.categories?.includes(categoryId))
            );

            const isBrandPresent = products.some(product => {
                return coupon?.brands?.includes(product?.product?.product?.id?.brand?._id)
            });
            const isProductPresent = products.some(product => {
                return coupon?.products?.includes(product?.product?._id)
            })

            if (isCategoryPresent) {
                if (coupon?.type === 'percent') {
                    let count = 0;
                    let totalSum = 0;
                    let cs = products.map(product => {
                        if (product?.product?.category?.id.some(categoryId => coupon?.categories?.includes(categoryId))) {
                            count++;
                            const totalPrice = Number(product?.total)
                            totalSum += totalPrice;
                        }
                    });

                    //   const updatedTotal = cartTotal * (1 - coupon.value / 100);
                    let dicountedValue = totalSum * (coupon.value / 100)
                    const updatedTotal = cartTotal - dicountedValue;
                    result.cartTotal = updatedTotal;
                    result.couponApplied = true;
                    result.message = "Coupon applied successfully."
                    return result;
                } else if (coupon?.type === 'amount') {
                    if (coupon?.value < cartTotal) {
                        const updatedTotal = Math.max(cartTotal - coupon.value, 0);
                        result.cartTotal = updatedTotal;
                        result.couponApplied = true;
                        result.message = "Coupon applied successfully."
                        return result;
                    }
                }
            } else if (isProductPresent) {
                if (coupon?.type === 'percent') {
                    let count = 0;
                    let totalSum = 0;
                    products.map(product => {
                        if (coupon?.products?.includes(product?.product?._id)) {
                            count++;
                            const totalPrice = Number(product?.total)
                            totalSum += totalPrice;
                        }
                    });

                    let dicountedValue = totalSum * (coupon.value / 100)
                    const updatedTotal = cartTotal - dicountedValue;
                    result.cartTotal = updatedTotal;
                    result.couponApplied = true;
                    result.message = "Coupon applied successfully."
                    return result;

                } else if (coupon?.type === 'amount') {
                    if (coupon.value < cartTotal) {
                        const updatedTotal = Math.max(cartTotal - coupon.value, 0);
                        result.cartTotal = updatedTotal;
                        result.couponApplied = true;
                        result.message = "Coupon applied successfully."
                        return result;
                    }
                }
            } else {
                if (coupon?.type === 'percent') {
                    let count = 0;
                    let totalSum = 0;

                    await Promise.all(products.map(async (product) => {
                        let productCollections = await getCollectionsByProductId(product?.product?._id);
                        if (coupon?.collections?.length > 0 && productCollections?.length > 0) {
                            coupon.collections.forEach((item) => {
                                productCollections.forEach((pId) => {
                                    if (item.toString() === pId.toString()) {
                                        count++;
                                        const totalPrice = Number(product?.total) // since for all products total is calculated in cart model itself
                                        totalSum = totalSum + totalPrice;

                                    }
                                })
                            })
                        }
                    }));

                    let discountedValue = totalSum * (coupon.value / 100);
                    const updatedTotal = cartTotal - discountedValue;
                    result.cartTotal = updatedTotal;
                    result.couponApplied = true;
                    result.message = "Coupon applied successfully."
                    return result;
                } else if (coupon?.type === 'amount' && coupon?.value > 0) {
                    if (coupon?.value < cartTotal) {
                        const updatedTotal = Math.max(cartTotal - coupon?.value, 0);
                        result.cartTotal = updatedTotal;
                        result.couponApplied = true;
                        result.message = "Coupon applied successfully."
                        return result;
                    }
                }
            }
        }
        
        else if (coupon.couponType === 'complete') {
            if (coupon.type === 'percent') {
                const updatedTotal = cartTotal * (1 - coupon.value / 100);
                result.cartTotal = updatedTotal;
                result.couponApplied = true;
                result.message = "Coupon applied successfully."
                return result;
            } else if (coupon.type === 'amount') {
                if (coupon.value < cartTotal) {
                    const updatedTotal = Math.max(cartTotal - coupon.value, 0);
                    result.cartTotal = updatedTotal;
                    result.couponApplied = true;
                    result.message = "Coupon applied successfully."
                    return result;
                }
            }
        }

        result.cartTotal = cartTotal;
        result.couponApplied = false;
        result.message = "No applicable coupon found."
        return result;
    } catch (error) {
        result.cartTotal = cartTotal;
        result.couponApplied = false;
        result.message = "An error occurred while applying coupon"
        return result;
    }
}

module.exports = { applyCoupon };
