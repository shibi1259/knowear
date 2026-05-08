const { BASE_URL } = require('../../../config/constants/common');
const helper = require('../../../util/responseHelper')
const messages = require('../../../config/constants').messages
const service = require('../../services/category.service')
const colelctionService = require('../../services/collection.service')
const { body, validationResult } = require("express-validator");
const menuService = require("../../services/menu.service");
const { getProductResponse, getHotspotResponse } = require('../../../util/productResponse');
const settingsService = require("../../services/general.settings.service");
const db = require("../../db/index");

exports.validate = (method) => {
   switch (method) {
      case "category": {
         return [
            body("page", "Page is required").exists(),
            body("limit", "Limit is required").exists(),
         ];
      }
      case "sub-category": {
         return [
            body("page", "Page is required").exists(),
            body("limit", "Limit is required").exists(),
            body("category", "Category is required").exists(),
         ];
      }
   }
};

exports.getCategories = async (req, res, next) => {
   try {
      // Add caching for category data
      res.set('Cache-Control', 'public, max-age=1800'); // 30 minutes cache

      !req.body.page ? body.page = 1 : null;
      !req.body.limit ? body.limit = 10 : null;

      const { body } = req
      const category = await service.searchCategory({ isActive: true, isDelete: false, isRoot: true }, body?.page, body?.limit)

      helper.deliverResponse(res, 200, category, {
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

exports.getAllCategoriesBySlug = async (req, res, next) => {
   try {
      const { body } = req
      const category = await service.getAllCategoryBySlug({ isActive: true, isDelete: false, slug: body?.slug })
      if (!category) {
         return helper.deliverResponse(res, 404, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
         });
      }
      helper.deliverResponse(res, 200, category, {
         "error_code": messages.successResponse.error_code,
         "error_message": messages.successResponse.error_message
      });
   } catch (error) {
      console.log("error caught in getAllCategoriesBySlug controller: " + error)
      helper.deliverResponse(res, 422, {}, {
         "error_code": messages.serverError.error_code,
         "error_message": messages.serverError.error_message
      });
   }
}

exports.getCategoryBySlug = async (req, res, next) => {
   try {
      const { body } = req
      const category = await service.getCategoryDetails({ slug: body?.slug })
      if (!category) {
         return helper.deliverResponse(res, 404, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
         });
      }
      helper.deliverResponse(res, 200, category, {
         "error_code": messages.successResponse.error_code,
         "error_message": messages.successResponse.error_message
      });
   } catch (error) {
      console.log("error caught in getCategoryBySlug controller: " + error)
      helper.deliverResponse(res, 422, {}, {
         "error_code": messages.serverError.error_code,
         "error_message": messages.serverError.error_message
      });
   }
}

exports.getFeaturedCategories = async (req, res, next) => {
   try {
      // Add caching for featured categories
      res.set('Cache-Control', 'public, max-age=3600'); // 1 hour cache
      
      let projection = { file: 1, name: 1, slug: 1 }
      const response = await service.getCategories({ isActive: true, isDelete: false }, projection, { name: 1 })

      // Optimize category mapping with map instead of for loop
      let categories = response.map(_category => ({
         "image": _category?.thumbnail ? BASE_URL + _category?.thumbnail?.path : null,
         "text": { "text": _category?.name, },
         "params": { "slug": _category?.slug }
      }));

      helper.deliverResponse(res, 200, categories, {
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

exports.getSubCategories = async (req, res, next) => {
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
      const query = { isActive: true, isDelete: false, isRoot: false, "parent.catid": body?.category }
      const category = await service.searchCategory(query, body?.page, body?.limit)
      helper.deliverResponse(res, 200, category, {
         "error_code": messages.successResponse.error_code,
         "error_message": messages.successResponse.error_message
      });
   } catch {
      helper.deliverResponse(res, 422, {}, {
         "error_code": messages.serverError.error_code,
         "error_message": messages.serverError.error_message
      });
   }
}

exports.getMegaCategories = async (req, res, next) => {
   try {
      let categoriesResult = []
      const query = { isActive: true, isDelete: false, isRoot: true, isMegaMenu: true }
      const mainCategories = await service.getCategories(query)
      const menuItems = await menuService.find({ isActive: true, isDelete: false }, { _id: 0, __v: 0, createdAt: 0, createdBy: 0, updatedAt: 0, refid: 0, isActive: 0, isDelete: 0 })
      const collection = await colelctionService.findOne({ isActive: true, isDelete: false, isHighlighted: true })

      let menuResults = menuItems.map((menuItem) => {
         return {
            title: menuItem.title,
            menuType: menuItem.menuType,
            redirection: menuItem.redirection,
            icon: menuItem?.icon ? BASE_URL + menuItem?.icon?.path : null
         }
      })


      let response = {
         megaMenu: categoriesResult,
         featuredMenu: menuResults,
         collection: { title: collection?.name, slug: collection?.slug }
      }

      for (let _main of mainCategories) {
         const categories = await service.getCategories({ "parent.refid": _main?._id, isActive: true, isDelete: false, isMegaMenu: true })
         let subCategories = []
         for (let _cat of categories) subCategories.push({ title: _cat?.name, slug: _cat?.slug })
         categoriesResult.push({
            title: _main?.name,
            slug: _main?.slug,
            categories: subCategories
         })
      }

      helper.deliverResponse(res, 200, response, {
         "error_code": messages.successResponse.error_code,
         "error_message": messages.successResponse.error_message
      });
   } catch {
      helper.deliverResponse(res, 422, {}, {
         "error_code": messages.serverError.error_code,
         "error_message": messages.serverError.error_message
      });
   }
}

exports.getCategoryLandingWeb = async (req, res) => {
   try {
      const { body } = req
      const category = await db.Category.findOne({ slug: body?.category })
      const categoryLanding = await service.getCategoryLanding({ isDelete: false, isActive: true, category: category?._id });
      console.log("categoryLanding",categoryLanding,category?._id)
      if (!categoryLanding) {
         helper.deliverResponse(res, 404, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
         });
         return;
      }
      const settings = await settingsService.findOne({});

      // Function to add BASE_URL to image paths
      const addBaseUrl = (imagePath) => {
         if (!imagePath) return imagePath;
         return `${process.env.BASE_URL}${imagePath}`;
      };

      // Function to transform array of image paths
      const transformImageArray = (images) => {
         if (!images) return images;
         return images.map(image => addBaseUrl(image));
      };

      // Get the clean document data without Mongoose metadata
      const cleanCategoryLanding = categoryLanding._doc;

      // Transform all image fields
      const transformedData = {
         ...cleanCategoryLanding,
         mainImage: addBaseUrl(cleanCategoryLanding.mainImage),
         firstIcon: addBaseUrl(cleanCategoryLanding.firstIcon),
         secondIcon: addBaseUrl(cleanCategoryLanding.secondIcon),
         thirdIcon: addBaseUrl(cleanCategoryLanding.thirdIcon),
         fourthIcon: addBaseUrl(cleanCategoryLanding.fourthIcon),
         fifthIcon: addBaseUrl(cleanCategoryLanding.fifthIcon),
         sixthIcon: addBaseUrl(cleanCategoryLanding.sixthIcon),
         seventhIcon: addBaseUrl(cleanCategoryLanding.seventhIcon),
         images: transformImageArray(cleanCategoryLanding.images),
         images2: transformImageArray(cleanCategoryLanding.images2),
         video: addBaseUrl(cleanCategoryLanding.video),
         interactiveImage: addBaseUrl(cleanCategoryLanding.interactiveImage)
      };

      // Transform the products with BASE_URL
      const transformedProducts = cleanCategoryLanding.products.map(product => {
         const transformedProduct = getProductResponse(product, settings);
         return transformedProduct;
      });

      // Transform the products3
      const transformedProducts3 = cleanCategoryLanding.products3.map(product => {
         const transformedProduct = getProductResponse(product, settings);
         return transformedProduct;
      });

      // Transform the products4
      const transformedProducts4 = cleanCategoryLanding.products4.map(product => {
         const transformedProduct = getProductResponse(product, settings);
         return transformedProduct;
      });

      // Transform the hotspots
      const transformedHotspots = cleanCategoryLanding.hotspots.map(hotspot => {
         const transformedHotspot = getHotspotResponse(hotspot?.productId, hotspot, settings);
         return transformedHotspot;
      });

      // Create the final response data
      const responseData = {
         ...transformedData,
         products: transformedProducts,
         products3: transformedProducts3,
         products4: transformedProducts4,
         hotspots: transformedHotspots
      };

      helper.deliverResponse(res, 200, responseData, {
         "error_code": messages.successResponse.error_code,
         "error_message": messages.successResponse.error_message
      });
   } catch (error) {
      console.log("trouser",error)
      helper.deliverResponse(res, 422, {}, {
         "error_code": messages.serverError.error_code,
         "error_message": messages.serverError.error_message
      });
   }
}