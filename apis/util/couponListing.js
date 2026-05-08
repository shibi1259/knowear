const couponService = require("../app/services/coupon.service");
const settingsService = require('../app/services/general.settings.service');
const mongoose = require('mongoose');
require("dotenv").config();

let BASE_URL = process.env.BASE_URL
const db = require("../app/db/index");
const { app } = require("firebase-admin");
const { getCollectionsByProductId } = require("./getCollections");
async function getApplicableCoupons(cart, customerDetails) {
    try {
        const settings = await settingsService.findOne({ })
        // Initialize an array to store applicable coupons
        let applicableCoupons = [];
        // Iterate through each product in the cart
        let coupons = []; 
        for (const cartProduct of cart?.products) {
            const productId = cartProduct?.product?._id;

            const productCategories = cartProduct?.product?.category; // array of category ids
            let productCollections = await getCollectionsByProductId(productId);
            productCollections = productCollections.map(id => {
                return id.toString();
            })

   
            // Query the coupons collection to find applicable coupons
            coupons = await db?.Coupon?.find({
                $and: [
                    {
                        $or: [
                            { products: productId },
                            { collections: { $in: productCollections } },
                            { categories: { $in: productCategories } },
                            { couponType: "complete" }
                        ]
                    },
                    { isActive: true },
                    { isVisibility: true }, // Check if isVisibility is true
                    { isDelete: false } // Check if isDelete is false
                ]
            });

            applicableCoupons.push(...coupons);
        }

        //Removing all duplicate coupons using set 
        applicableCoupons = Array.from(new Set(applicableCoupons.map(JSON.stringify))).map(JSON.parse);

        //filtering applicable coupons 
        applicableCoupons = applicableCoupons?.filter(coupon => {
            let validCoupon = true;
            if (coupon?.details?.type == "limited" && Number(coupon?.details?.value) <= 0) {
                validCoupon = false;
            }

            //Checking coupon usage per user
            if (customerDetails) {
                let couponUsageCount = customerDetails?.coupons?.filter(c => c == coupon?._id).length;
                if (couponUsageCount >= coupon?.countPerUser) {
                    validCoupon = false
                }
            }

            //checking coupon start and end dates 
            const currentDate = new Date().toISOString();
            if (coupon.lastDate < currentDate || coupon.fromDate > currentDate) {
                validCoupon = false;
            }

            return validCoupon;
        });


        let output = applicableCoupons?.map(item => {
            let isApplied = cart?.coupon?._id == item?._id;

            return {
                isDisabled: false,
                isApplied,
                value: getCouponDiscount(item),
                message: getCouponMessage(item),
                coupon: item?.code,
                slug: item?.slug,
                title: item?.title,
                image: item?.file ? BASE_URL + item?.file : null,
                style: {
                    background: item?.style?.background,
                    text: {
                        color: item?.style?.text?.color,
                        fontWeight: item?.style?.text?.fontWeight
                    }
                }
            }
        });

        function getCouponMessage(item) {
            let message = "";
            if (item?.details?.type == "limited") { message += "Limited time offer! " }
            if (item.type == "percent") { return `Get instant ${item.value}% discount on eligible products ` }
            else if (item.type == "amount") {
                return `Grab an immediate ${settings?.currency}${item.value} discount! `
            }
        }
        function getCouponDiscount(item) {
            if (item.type == "percent") { return `${item.value}% OFF` }
            else if (item.type == "amount") {
                return `${settings?.currency}${item.value} OFF`
            }
        }
        return output
    } catch (error) {
        console.log("error cought in couponLising utility function", error)
    }

}

module.exports = {
    getApplicableCoupons
}