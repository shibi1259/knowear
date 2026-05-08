const helper = require('../../../util/responseHelper')
const messages = require('../../../config/constants').messages
const service = require('../../services/customer.service')
const addressService = require('../../services/address.service')
const productService = require('../../services/product.service')
const cartService = require('../../services/cart.service')
const settingsService = require('../../services/general.settings.service')
const { body, validationResult } = require("express-validator");
const notificationService = require("../../services/notification.service")
const searchHistoyService = require("../../services/search.history.service")
const crypto = require('crypto');
const mailer = require("../../../util/sendMail")
const verifyEmailTemplate = require("../../../util/templates/verification")
const { BASE_URL } = require('../../../config/constants/common')
const { getProductResponse } = require('../../../util/productResponse')
const axios = require('axios')

exports.validate = (method) => {
   switch (method) {
      case "add": {
         return [
            body("firstlane", "Frist lane is required").exists(),
            body("city", "City is required").exists(),
            body("landmark", "Landmark is required").exists(),
            body("state", "State is required").exists(),
            body("type", "Type is required").exists(),
         ];

      }
      case "update": {
         return [
            body("firstlane", "Frist lane is required").exists(),
            body("city", "City is required").exists(),
            body("landmark", "Landmark is required").exists(),
            body("state", "State is required").exists(),
            body("type", "Type is required").exists(),
            body("refid", "Id is required").exists(),
         ];
      }
      case "choose": {
         return [
            body("type", "Type is required").exists(),
            body("clickPoint", "Click point is required").exists(),
            body("date", "Date is required").exists(),
            body("time", "Time is required").exists(),
         ];
      }
      case "notifications": {
         return [
            body("page", "Page is required").exists(),
            body("limit", "Limit is required").exists(),
         ];
      }
      case "update-email": {
         return [
            body("email", "Email is required").exists(),
         ];
      }
      case "update-mobile": {
         return [
            body("countryCode", "Country code is required").exists(),
            body("mobile", "Mobile number is required").exists(),
         ];
      }
   }
};

exports.getCustomerDetails = async (req, res) => {
   try {
      const projection = { __v: 0, createdAt: 0, updatedAt: 0, _id: 0, isActive: 0, isDelete: 0, 'address._id': 0, tokens: 0, wishlist: 0, verificationToken: 0, referrals: 0, notification: 0 }
      const response = await service.getCustomer({ userid: res.locals.user.userid, isActive: true }, projection)
      helper.deliverResponse(res, 200, response, messages.successResponse)
   } catch (error) {
      helper.deliverResponse(res, 422, {}, messages.serverError);
   }
}

exports.addAddress = async (req, res, next) => {
   try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
         return helper.deliverResponse(res, 422, errors, messages.VALIDATION_ERROR)
      }

      const { userid } = res?.locals?.user
      const { body } = req
      const addressDetails = await addressService.findOne({ _id: body.addressId })
      const customer = await service.getCustomer({ userid: userid, isActive: true, isDelete: false })
      body.customer = customer?._id
      body.refid = await addressService.count({}) + 1

      const existingAddresses = await addressService.find({ customer: customer._id, isDelete: false });

      if (existingAddresses.length === 0 && body?.isDefaultShipping == false) {
         body.isDefaultShipping = true
      }

      if (body?.isDefaultShipping == true) {
         const response = await addressService.updateMany(
            { isDefaultShipping: true, customer: customer?._id, _id: { $ne: addressDetails?._id } },
            { isDefaultShipping: false }
         )
      }

      const response = await addressService.add(body)
      if (response instanceof Error) {
         helper.deliverResponse(res, 422, response, messages.serverError);
      } else {
         helper.deliverResponse(res, 200, response, messages.ADD_ADDRESS);
      }
   } catch (error) {
      console.log("Error caught in add address API :: " + error);
      helper.deliverResponse(res, 422, {}, messages.serverError);
   }
}

exports.updateAddress = async (req, res, next) => {
   try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
         return helper.deliverResponse(res, 422, errors, messages.VALIDATION_ERROR)
      }

      let { body } = req
      if (req?.query?.platform == 'app') {
         body = JSON.parse(body)
      }
      const { action } = req.query
      const { userid } = res?.locals?.user
      const customer = await service.getCustomer({ userid: userid, isActive: true, isDelete: false })
      switch (action) {
         case 'update':
            if (body?.isDefaultShipping == true) {
               const projection = { __v: 0, createdAt: 0, updatedAt: 0, _id: 0, isDelete: 0 }
               const response = await addressService.find({ customer: customer?._id, isDelete: false }, projection)
               if (response.length > 0) {
                  for (let address of response) if (address?.isDefaultShipping) await addressService.update({ refid: address?.refid }, { isDefaultShipping: false })
               }
            }
            break
         case 'delete':
            body.isDelete = true
            break
         case 'manage':
            const response = await addressService.find({ customer: customer?._id, isDelete: false }, projection)
            if (response.length > 0) {
               for (let address of response) if (address?.isDefault) await addressService.update({ refid: address?.refid }, { isDefault: false })
            }
            const address = await addressService.findOne({ refid: body?.refid, isDelete: false }, projection)
            body = { ...address }
            body.isDefault = true
            break
      }
      await addressService.update({ refid: body?.refid }, body)
      helper.deliverResponse(res, 200, {}, messages.UPDATE_ADDRESS);
   } catch (error) {
      helper.deliverResponse(res, 422, {}, messages.serverError);
   }
}

exports.find = async (req, res, next) => {
   try {
      const { userid } = res?.locals?.user
      const customer = await service.getCustomer({ userid: userid, isActive: true, isDelete: false })
      const projection = { __v: 0, createdAt: 0, updatedAt: 0, isDelete: 0 }
      const response = await addressService.find({ customer: customer?._id, isDelete: false }, projection)
      helper.deliverResponse(res, 200, response, {
         "error_code": messages.successResponse.error_code,
         "error_message": messages.successResponse.error_message
      });
   } catch (error) {
      console.log(`Error caught in findOne :: ${error}`);
      helper.deliverResponse(res, 422, {}, messages.serverError);
   }
}

exports.findOne = async (req, res, next) => {
   try {
      const { body } = req
      const response = await addressService.findOne(
         { refid: body.refid, isDelete: false },
         { __v: 0, createdAt: 0, updatedAt: 0, _id: 0, isDelete: 0 }
      )
      helper.deliverResponse(res, 200, response, messages.successResponse);
   } catch (error) {
      helper.deliverResponse(res, 422, {}, messages.serverError);
   }
}

exports.getWishlist = async (req, res, next) => {
   try {      
      // Add caching for wishlist data
      res.set('Cache-Control', 'private, max-age=300'); // 5 minutes cache
      
      let products = []
      const { userid } = res?.locals?.user;
      
      // First get customer and settings
      const [response, settings] = await Promise.all([
         service.getCustomer({ userid: res?.locals?.user?.userid }),
         settingsService.findOne({})
      ]);
      
      // Get cart details after we have the customer ID
      let cartDetails = null;
      if (response?._id) {
         cartDetails = await cartService.getCart({
            "customer": response?._id,
            isPurchased: false,
            isActive: true,
            isDelete: false,
         }).catch(() => null); // Don't fail if cart lookup fails
      }
      
      // Get cart product IDs once for efficient lookup
      const cartProductIds = new Set();
      if (cartDetails?.products) {
         cartDetails.products.forEach(cartproduct => {
            cartProductIds.add(String(cartproduct?.product?._id));
         });
      }
      
      // Process wishlist products efficiently
      if (response?.wishlist?.length > 0) {
         products = response.wishlist.map(product => {
            const productResponse = getProductResponse(product, settings);
            // Efficient cart check using Set lookup
            productResponse.isCart = cartProductIds.has(String(productResponse?.id));
            return productResponse;
         });
      }

      helper.deliverResponse(res, 200, products, messages.successResponse);
   } catch (error) {
      helper.deliverResponse(res, 422, {}, messages.serverError);
   }
}

exports.manageWishlist = async (req, res) => {
   const [
      productDetails,
      customerDetails
   ] = await Promise.all([
      productService.findOne({ slug: req.body.slug }),
      service.getCustomer({ userid: res.locals.user.userid })
   ])

   let wishlist = customerDetails?.wishlist?.map(productItem => 
         productItem._id ? productItem._id.toString() : productItem.toString()
   ) || [];

   const productId = productDetails?._id.toString();

   if (wishlist.includes(productId)) {
      wishlist = wishlist.filter(item => item !== productId);
   } else {
      wishlist.unshift(productId);
   }

   const response = await service.update({ userid: res?.locals?.user?.userid }, { $set: { wishlist: wishlist } })
   if (response instanceof Error) {
      helper.deliverResponse(res, 422, {}, messages.serverError);
   } else {
      helper.deliverResponse(res, 200, response, messages.successResponse);
   }
}

exports.getNotifications = async (req, res, next) => {
   try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
         return helper.deliverResponse(res, 422, errors, messages.VALIDATION_ERROR)
      }

      const { body } = req
      const { userid } = res?.locals?.user
      const customerDetails = await service.getCustomer({ userid: userid, isActive: true, isDelete: false })
      const notifications = await notificationService.search({ 'customers': { $in: [customerDetails?._id] }, isActive: true, isDelete: false, channel: { $in: ['app', 'push'] } }, body?.page, body?.limit, {}, { createdAt: -1 })
      let notificationData = []

      let today = new Date(new Date().setHours(0, 0, 0, 0))
      const currentDate = new Date();
      const yesterdayDate = new Date(currentDate);
      yesterdayDate.setDate(currentDate.getDate() - 1);
      yesterdayDate.setHours(0, 0, 0, 0);
      let yesterday = new Date(yesterdayDate);

      for (let notification of notifications?.data) {
         let date = new Date(notification?.createdAt).toDateString()
         if (new Date(notification?.createdAt) >= today) date = 'Today'
         if (new Date(notification?.createdAt) < today && new Date(notification?.createdAt) >= yesterday) date = 'Yesterday'
         notificationData.push({
            title: notification?.title,
            content: notification?.content,
            image: notification?.thumbnail ? notification?.thumbnail?.path : null,
            date: date
         })
      }

      helper.deliverResponse(res, 200,
         {
            data: notificationData,
            lastPage: notifications?.isLastPage
         }, {
         "error_code": messages.successResponse.error_code,
         "error_message": messages.successResponse.error_message
      });
   } catch (error) {
      helper.deliverResponse(res, 422, {}, {
         "error_code": messages.serverError.error_code,
         "error_message": messages.serverError.error_message
      });
   }
}

exports.clearHistory = async (req, res) => {
   try {

      const { body } = req
      const { userid, devicetoken } = res?.locals?.user
      let userDetails = {}
      let searchHistory = []
      if (userid) {
         userDetails = await service.getCustomer({ userid: userid })
         searchHistory = userDetails?.searchHistory ? userDetails?.searchHistory : []
      } else {
         const searchHistoryDetails = await searchHistoyService.findOne({ deviceToken: devicetoken, isDelete: false })
         searchHistory = searchHistoryDetails?.searchHistory ? searchHistoryDetails?.searchHistory : []
      }

      if (searchHistory.includes(body?.keyword)) searchHistory = searchHistory.filter(item => item != body?.keyword)

      if (userid) {
         const user = await service.update({ userid: userid }, { $set: { searchHistory: searchHistory } })
         if (user) {
            helper.deliverResponse(res, 200, { searchHistory: user?.searchHistory || [] }, {
               "error_code": messages.successResponse.error_code,
               "error_message": messages.successResponse.error_message
            });
         }
      } else {
         const response = await searchHistoyService.update({ deviceToken: devicetoken, isDelete: false }, { searchHistory: searchHistory })
         if (response) {
            helper.deliverResponse(res, 200, { searchHistory: response?.searchHistory || [] }, {
               "error_code": messages.successResponse.error_code,
               "error_message": messages.successResponse.error_message
            });
         }
      }

   } catch (error) {
      console.log(error)
      helper.deliverResponse(res, 422, {}, {
         "error_code": messages.serverError.error_code,
         "error_message": messages.serverError.error_message
      });
   }
}

exports.generateVerification = async (req, res) => {
   try {
      const { userid } = res?.locals?.user
      const customerDetails = await service.getCustomer({ userid: userid, isDelete: false, isEmailVerified: false })
      const settings = await settingsService.findOne({})
      const token = crypto.randomBytes(20).toString('hex');
      setTimeout(async () => {
         const user = await service.getCustomer({ userid: userid, isDelete: false });
         if (user?.verificationToken?.email === token) {
            await service.update({ userid: userid }, { $set: { verificationToken: { email: '', mobile: customerDetails?.verificationToken?.mobile } } });
         }
      }, 120000);
      const domain = settings?.domain.endsWith('/') ? settings?.domain : `${settings?.domain + '/'}`
      const url = domain + 'verify-email/' + token
      if (customerDetails) {
         const user = await service.update({ userid: userid }, { $set: { verificationToken: { email: token, mobile: customerDetails?.verificationToken?.mobile } } })
         if (user) {
            const subject = 'Verify your Email'
            const content = 'Please click on the below link to verify your email address'
            const html = await verifyEmailTemplate.verificationTemplate({ storeName: settings?.name, redirect: url, expireIn: '2', logoUrl: BASE_URL + settings?.logo, primaryColor: settings?.colors?.primary })
            await mailer.sendMail(customerDetails?.email, subject, content, html)
            helper.deliverResponse(res, 200, {}, {
               "error_code": messages.successResponse.error_code,
               "error_message": messages.successResponse.error_message
            });
         }
      }
   } catch (error) {
      helper.deliverResponse(res, 422, {}, {
         "error_code": messages.serverError.error_code,
         "error_message": messages.serverError.error_message
      });
   }
}

exports.verifyEmailAddress = async (req, res) => {
   try {
      const { body } = req
      const customerDetails = await service.getCustomer({ 'verificationToken.email': body?.token, isDelete: false })
      if (customerDetails) {
         if (customerDetails?.verificationToken?.email) {
            if (body?.token == customerDetails?.verificationToken?.email) {
               const user = await service.update({ userid: customerDetails?.userid }, {
                  $set: {
                     verificationToken: { email: '', mobile: customerDetails?.verificationToken?.mobile },
                     isEmailVerified: true
                  }
               })
               if (user) {
                  helper.deliverResponse(res, 200, {}, {
                     "error_code": messages.successResponse.error_code,
                     "error_message": messages.successResponse.error_message
                  });
               }
            } else {
               helper.deliverResponse(res, 200, {}, {
                  "error_code": messages.INVALID_VERIFICATION_TOKEN.error_code,
                  "error_message": messages.INVALID_VERIFICATION_TOKEN.error_message
               });
            }
         } else {
            helper.deliverResponse(res, 200, {}, {
               "error_code": messages.VERIFICATION_TOKEN_EXPIRED.error_code,
               "error_message": messages.VERIFICATION_TOKEN_EXPIRED.error_message
            });
         }
      } else {
         helper.deliverResponse(res, 200, {}, {
            "error_code": messages.VERIFICATION_TOKEN_EXPIRED.error_code,
            "error_message": messages.VERIFICATION_TOKEN_EXPIRED.error_message
         });
      }
   } catch (error) {
      helper.deliverResponse(res, 422, {}, {
         "error_code": messages.serverError.error_code,
         "error_message": messages.serverError.error_message
      });
   }
}

exports.updateEmail = async (req, res) => {
   try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
         helper.deliverResponse(res, 422, errors, {
            "error_code": messages.VALIDATION_ERROR.error_code,
            "error_message": messages.VALIDATION_ERROR.error_message
         })
         return;
      }

      const { body } = req
      const { userid } = res?.locals?.user
      const userDetails = await service.getCustomer({ userid: userid })
      if (userDetails) {
         const duplicateUser = await service.getCustomer({ userid: { $ne: userid }, email: body.email.toLowerCase() })
            ? true : false
         if (duplicateUser) {
            helper.deliverResponse(res, 422, {}, {
               "error_code": messages.DUPLICATE_EMAIL.error_code,
               "error_message": messages.DUPLICATE_EMAIL.error_message
            });
         } else {
            if (userDetails.email != body.email.toLowerCase()) {
               const userResponse = await service.update({ userid: userid }, { $set: { email: body.email.toLowerCase(), isEmailVerified: false } })
               if (userResponse instanceof Error) {
                  helper.deliverResponse(res, 422, {}, {
                     "error_code": messages.serverError.error_code,
                     "error_message": messages.serverError.error_message
                  });
               } else {
                  helper.deliverResponse(res, 200, {}, {
                     "error_code": messages.EMAIL_UPDATED.error_code,
                     "error_message": messages.EMAIL_UPDATED.error_message
                  });
               }
            } else {
               helper.deliverResponse(res, 200, {}, {
                  "error_code": messages.EMAIL_UPDATED.error_code,
                  "error_message": messages.EMAIL_UPDATED.error_message
               });
            }
         }
      } else {
         helper.deliverResponse(res, 422, {}, {
            "error_code": messages.NO_USER_FOUND.error_code,
            "error_message": messages.NO_USER_FOUND.error_message
         });
      }
   } catch (error) {
      console.log('Error caught in update email API :: ' + error);
      helper.deliverResponse(res, 422, {}, {
         "error_code": messages.serverError.error_code,
         "error_message": messages.serverError.error_message
      });
   }
}

exports.updateMobile = async (req, res) => {
   try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
         helper.deliverResponse(res, 422, errors, {
            "error_code": messages.VALIDATION_ERROR.error_code,
            "error_message": messages.VALIDATION_ERROR.error_message
         })
         return;
      }

      const { body } = req
      const { userid } = res?.locals?.user
      const userDetails = await service.getCustomer({ userid: userid })
      if (userDetails) {
         const duplicateUser = await service.getCustomer({ userid: { $ne: userid }, countryCode: body.countryCode, mobile: body.mobile })
            ? true : false
         if (duplicateUser) {
            helper.deliverResponse(res, 422, {}, {
               "error_code": messages.DUPLICATE_MOBILE.error_code,
               "error_message": messages.DUPLICATE_MOBILE.error_message
            });
         } else {
            if (userDetails?.countryCode + userDetails.mobile != body.countryCode + body.mobile) {
               const userResponse = await service.update({ userid: userid }, {
                  $set: {
                     mobile: body.mobile,
                     countryCode: body.countryCode,
                     isMobileVerified: false
                  }
               })
               if (userResponse instanceof Error) {
                  helper.deliverResponse(res, 422, {}, {
                     "error_code": messages.serverError.error_code,
                     "error_message": messages.serverError.error_message
                  });
               } else {
                  helper.deliverResponse(res, 200, {}, {
                     "error_code": messages.MOBILE_UPDATED.error_code,
                     "error_message": messages.MOBILE_UPDATED.error_message
                  });
               }
            } else {
               helper.deliverResponse(res, 200, {}, {
                  "error_code": messages.MOBILE_UPDATED.error_code,
                  "error_message": messages.MOBILE_UPDATED.error_message
               });
            }
         }
      } else {
         helper.deliverResponse(res, 422, {}, {
            "error_code": messages.NO_USER_FOUND.error_code,
            "error_message": messages.NO_USER_FOUND.error_message
         });
      }
   } catch (error) {
      console.log('Error caught in update email API :: ' + error);
      helper.deliverResponse(res, 422, {}, {
         "error_code": messages.serverError.error_code,
         "error_message": messages.serverError.error_message
      });
   }
}
exports.getAddressLocations = async (req, res) => {
   const { place } = req.query
   const { countries } = req.body
   const response = await this.getGeoPlaces(place, countries)
 
   if (response.status == 'OK' || response.status == 'ZERO_RESULTS') {
      helper.deliverResponse(res, 200, response, messages.SUCCESS_RESPONSE);
   } else {
      helper.deliverResponse(res, 422, response, messages.SERVER_ERROR);
   }
}
exports.getGeoPlaces = async (place, countries = []) => {
  const mapKey = process.env.GOOGLE_MAPS_API_KEY;
  const results = [];

  try {
    // If no specific countries are provided, make a single request without the country component
    if (countries.length === 0) {
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${place}&key=${mapKey}`;
      const response = await axios.get(url);
      // console.log(response.data);
      
      const { predictions } = response.data;
      results.push(
        ...predictions.map((prediction) => ({
          description: prediction.description,
          placeId: prediction.place_id,
          structured_formatting: prediction.structured_formatting,
          types: prediction.types,
          
        }))
      );
    } else {
      // Make a separate request for each country in the array
      for (const country of countries) {
        const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${place}&key=${mapKey}&components=country:${country}`
        const response = await axios.get(url);
        const { predictions } = response.data;

      //   console.log(response.data);
        
        results.push(
          ...predictions.map((prediction) => ({
            description: prediction.description,
            placeId: prediction.place_id,
          }))
        );
      }
    }
    return { status: "OK", predictions: results };
  } catch (error) {
    return { status: "ERROR", message: error.message};
  }
};
exports.getLocationDetails = async (req, res, next) => {
   
   const { placeId } = req.params
   // console.log(req.params,"place id",placeId);
   const response = await this.getPlaceDetails(placeId)
   // console.log(response,"response   for the place data ");
   if (response.status == 'OK') {
      helper.deliverResponse(res, 200, response.result, {
         "error_code": messages.successResponse.error_code,
         "error_message": messages.successResponse.error_message
      });
   } else {
      helper.deliverResponse(res, 422, response, {
         "error_code": messages.SERVER_ERROR.error_code,
         "error_message": messages.SERVER_ERROR.error_message
      });
   }
}

exports.getPlaceDetails = async (placeId) => {
  const mapKey = process.env.GOOGLE_MAPS_API_KEY;
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${mapKey}`;
//   console.log(url,"url for the place id");
  try {
    const response = await axios.get(url);
    const { status, result } = response.data;
   //  console.log(response.data,"response data  from the searched api ");
   //  if (result) {
   //    const location = result?.formatted_address;
   //    const addressDetails = result?.address_components;
   //    const geometry = result?.geometry;
   //    // return constructAddressResponse(status, location, addressDetails, geometry);
   //  }
    // Construct response object with success flag
    const placeDetailsResponse = {
      status: status,
      result: result || null,
      success: status === 'OK' && !!result
    };

    return placeDetailsResponse;
    return response?.data?.result;
  } catch (error) {
    return { status: "ERROR", message: error.message };
}
};
const constructAddressResponse = (status, formattedAddress = "", addressComponents = [], geometry = {}) => {  
   const address = {
     firstlane: addressComponents.find(component => component.types.includes('plus_code'))?.long_name || "" + " " + 
               (addressComponents.find(component => component.types.includes('premise'))?.long_name || "") + " " + 
               (addressComponents.find(component => component.types.includes('intersection'))?.long_name || ""),
     secondlane: "",
     landmark: addressComponents.find(component => component.types.includes('sublocality'))?.long_name || "",
     area: addressComponents.find(component => component.types.includes('route'))?.long_name || "" + " " + 
          (addressComponents.find(component => component.types.includes('locality'))?.long_name || ""),
     city: addressComponents.find(component => component.types.includes('administrative_area_level_3'))?.long_name || "",
     state: addressComponents.find(component => component.types.includes('administrative_area_level_1'))?.long_name || "",
     pincode: addressComponents.find(component => component.types.includes('postal_code'))?.long_name || "",
     country: addressComponents.find(component => component.types.includes('country'))?.short || "",
     coordinates: {
       latitude: geometry.location?.lat || "",
       longitude: geometry.location?.lng || "",
     }
   };
 
   return {
     status,
     formattedAddress,
     address,
   };
 };