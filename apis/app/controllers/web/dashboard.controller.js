const brandService = require("../../services/brand.service")
const collectionService = require("../../services/collection.service")
const categoryService = require("../../services/category.service")
const bannerService = require("../../services/banner.service")
const helper = require('../../../util/appWebResponse')
const messages = require('../../../config/constants').messages
const jwt = require('jsonwebtoken');
const constant = require("../../../config/constants");
const dashboardService = require("../../services/dashboard.service")
const key = constant.common.KEYS
const cartService = require("../../services/cart.service")
const customerService = require("../../services/customer.service")
const productService = require("../../services/product.service")

exports.dashboard = async (req, res, next) => {
   try {
      const { authorization, devicetoken } = req.headers

      let userid = null
      let deviceToken = null
      let cartDetails = {}
      let customerDetails = {}
      let wishlistProducts = []

      if (authorization) {
         let token = authorization.split('Bearer ')[1];
         jwt.verify(token, key.JWTSECRET, (err, decoded) => {
            if (err) userid = null
            userid = decoded?.userid
         })
      } else {
         deviceToken = devicetoken
      }
  
      let collectionItems = []
      let brandItems = []
      let categoryItems = []

      const page = 1
      const limit = 10
      let result = {}
      let data = []

      let dashboardDetails = await dashboardService.getDashboardDetails({ isActive: true, isDelete: false }, { createdAt: -1 }, 1)

      // Parallelize user data fetching for better performance
      if (userid) {
         [cartDetails, customerDetails] = await Promise.all([
            cartService.getCart({ "customer.refid": userid, isPurchased: false, isActive: true, isDelete: false }),
            customerService.getCustomer({ userid: userid, isDelete: false, isActive: true })
         ]);

         // Optimize wishlist processing with parallel product lookups
         if (customerDetails?.wishlist?.length > 0) {
            const wishlistPromises = customerDetails.wishlist.map(_product => 
               productService.getSingleProduct({ _id: _product, isDelete: false, isActive: true })
            );
            const wishlistProductDetails = await Promise.all(wishlistPromises);
            wishlistProducts = wishlistProductDetails.map(product => product?.slug).filter(Boolean);
         }
      } else {
         cartDetails = await cartService.getCart({ 'deviceToken': devicetoken, isActive: true, isDelete: false, isPurchased: false })
      }

      let cartProducts = cartDetails ? cartDetails?.products.map((cart) => cart?.product?.slug) : []

      if (dashboardDetails.length == 0) {
         const to = new Date(new Date().setHours(0, 0, 0, 0)).toISOString()
         const from = new Date(new Date().setHours(23, 59, 59, 59)).toISOString()
         
         // Parallelize all dashboard data fetching for major performance improvement
         const [category, brand, collections, banners] = await Promise.all([
            categoryService.categoryForDashboard({ isActive: true, isDelete: false, isFeatured: true }, page, 7),
            brandService.brandForDashboard({ isActive: true, isDelete: false }, page, limit),
            collectionService.featuredCollection({ isActive: true, isDelete: false, isFeatured: true }, {}, userid, deviceToken),
            bannerService.bannerForWebDashboard({ isActive: true, isDelete: false, validTo: { $gte: to }, validFrom: { $lte: from } })
         ]);

         if (banners.length > 0) data.push(banners[0])

         data.push(category)
         for (let _category of category?.category_items) categoryItems.push(_category?.params?.catid)

         if (collections.length >= 0) {
            data.push(collections[0])
            collectionItems.push(collections[0]?.refid)
         }

         if (banners.length >= 1) data.push(banners[1])
         if (banners.length >= 2) data.push(banners[2])

         if (collections.length >= 1) {
            data.push(collections[1])
            collectionItems.push(collections[1]?.refid)
         }

         if (banners.length >= 3) data.push(banners[3])
         if (banners.length >= 4) data.push(banners[4])

         if (collections.length >= 2) {
            data.push(collections[2])
            collectionItems.push(collections[2]?.refid)
         }

         if (banners.length >= 5) data.push(banners[5])

         if (collections.length >= 3) {
            data.push(collections[3])
            collectionItems.push(collections[3]?.refid)
         }

         if (banners.length >= 6) data.push(banners[6])
         if (banners.length >= 7) data.push(banners[7])

         if (collections.length >= 4) {
            data.push(collections[4])
            collectionItems.push(collections[4]?.refid)
         }

         if (banners.length >= 8) data.push(banners[8])
         if (banners.length >= 9) data.push(banners[9])

         if (collections.length >= 5) {
            data.push(collections[5])
            collectionItems.push(collections[5]?.refid)
         }
         
         data.push(brand)
         for (let _brand of brand?.brand_items) brandItems.push(_brand?.params?.brandid)

         let dashboardPayload = {
            dashboard: JSON.stringify(data),
            items: {
               collections: collectionItems,
               brands: brandItems,
               categories: categoryItems
            },
            refid: await dashboardService.countDashboard({}) + 1
         }
         await dashboardService.addDashboard(dashboardPayload)
      } else {
         let publishedData = dashboardDetails.pop()
         data = JSON.parse(publishedData.dashboard)
         let homeData = []
         for (let _item of data) {
            switch (_item?.type) {
               case 'banner-1':
                  homeData.push(_item)
                  break
               case 'banner-2':
                  homeData.push(_item)
                  break
               case 'banner-3':
                  homeData.push(_item)
                  break
               case 'banner-4':
                  homeData.push(_item)
                  break
               case 'brand':
                  homeData.push(_item)
                  break
               case 'category':
                  homeData.push(_item)
                  break
               case 'product':
                  
                  for (let _product of _item?.product_items) {
                     
                     
                     if (cartProducts.includes(_product?.params?.slug)) {
                        for (let cartItem of cartDetails?.products) {
                           if (cartItem?.product?.slug == _product?.params?.slug) _product.cart = { isCart: true, quantity: cartItem?.quantity }
                        }
                     } else {
                        _product.cart = { isCart: false, quantity: "0" }
                     }
                   

                     if (wishlistProducts.includes(_product?.params?.slug)) {
                        _product.favourite.status = true
                     } else {
                        _product.favourite.status = false
                     }
                  }
                  homeData.push(_item)
                  break
            }
         }

         data = homeData
      }

      result["home_details"] = data
      helper.deliverResponse(res, 200, result, {
         error_code: messages.successResponse.error_code,
         error_message: messages.successResponse.error_message,
      });
   } catch (error) {
      console.log(error, ' :: Error caught in dashboard API')
      helper.deliverResponse(res, 422, {}, {
         error_code: messages.serverError.error_code,
         error_message: messages.serverError.error_message,
      });
   }
}
