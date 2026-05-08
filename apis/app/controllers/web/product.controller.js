const helper = require("../../../util/responseHelper");
const db = require("../../db/index");
const messages = require("../../../config/constants").messages;
const service = require("../../services/product.service");
const productHeadService = require("../../services/product.head.service");
const categoryService = require("../../services/category.service");
const collectionService = require("../../services/collection.service");
const searchHistoryService = require("../../services/search.history.service");
const brandService = require("../../services/brand.service");
const customerService = require("../../services/customer.service");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const constant = require("../../../config/constants");
const { BASE_URL } = require("../../../config/constants/common");
const key = constant.common.KEYS;
const settingsService = require("../../services/general.settings.service");
const notifySubscribersService = require("../../services/notify.subscriber.service");
const guestService = require("../../services/guest.service");
const { getAttributes } = require("../../../util/getAttributes");
const ObjectId = require("mongoose").Types.ObjectId;
const cartService = require("../../services/cart.service");
const { getProductResponse } = require("../../../util/productResponse");

exports.getProductListing = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      helper.deliverResponse(res, 422, errors, {
        error_code: messages.VALIDATION_ERROR.error_code,
        error_message: messages.VALIDATION_ERROR.error_message,
      });
      return;
    }

    const { authorization, devicetoken } = req.headers;
    let userid = null;
    let deviceToken = null;
    let minPrice = 0;
    let maxPrice = 0;

    if (authorization) {
      let token = authorization.split("Bearer ")[1];
      jwt.verify(token, key.JWTSECRET, (err, decoded) => {
        if (err) userid = null;
        userid = decoded?.userid;
      });
    } else {
      deviceToken = devicetoken;
    }

    //Updating search keyword in db if
    if (req.body?.search?.length > 0) {
      let body = req.body;
      if (userid) {
        let customerDetails = await customerService.getCustomer({
          userid: userid,
          isDelete: false,
        });
        let searchHistory = [...customerDetails?.searchHistory];
        if (searchHistory.length > 50) searchHistory.pop();
        if (!searchHistory.includes(body?.search))
          searchHistory.unshift(body?.search);
        await customerService.update(
          { userid: userid, isDelete: false },
          { searchHistory: searchHistory }
        );
      } else if (deviceToken) {
        let searchHistoryDetails = await searchHistoryService.findOne({
          deviceToken: deviceToken,
          isDelete: false,
        });
        let searchHistory = [];
        if (searchHistoryDetails) {
          searchHistory = [...searchHistoryDetails?.searchHistory];
          if (searchHistory.length > 50) searchHistory.pop();
          if (!searchHistory.includes(body?.search))
            searchHistory.unshift(body?.search);
          await searchHistoryService.update(
            { deviceToken: deviceToken, isDelete: false },
            { searchHistory: searchHistory }
          );
        } else {
          await searchHistoryService.create({
            searchHistory: searchHistory,
            deviceToken: deviceToken,
          });
        }
      }
    }

    const { body } = req;

    if (!body.page) {
      body.page = 1;
    }

    if (!body.limit) {
      body.limit = 100;
    }

    const originQuery = [
      {
        $group: { _id: "$origin", count: { $sum: 1 } },
      },
      {
        $project: { _id: 0, origin: "$_id" },
      },
      {
        $sort: { origin: 1 },
      },
    ];

    let productOrigins = await service.aggregate(originQuery); //Get the list of origins
    productOrigins = productOrigins?.filter((item) => item?.origin).sort();

    const settings = await settingsService.findOne({});
    let filters = {
      categories: [],
      brands: [],
      attributes: [],
      price: { low: 0, high: 0, max: 0, min: 0 },
      collections: [],
      origins: productOrigins,
    };
    let response = {
      headers: { thumbnail: "", cover: "", title: "", description: "" },
      products: [],
      filters: filters,
    };
    let results = [];
    let coCategories = [];

    const category = await categoryService.getCategories({
      slug: { $in: body?.category },
      isDelete: false,
      isActive: true,
    });

    //handling collections
    let collection = null;
    if (body?.collection) {
      collection = await collectionService.findOne({
        slug: body?.collection, //collection slug as a single keyword
        isDelete: false,
        isActive: true,
      });
    }

    //Highest and lowest price range for the products
    let rangePriceQuery = [
      { $match: { isActive: true, isDelete: false, isVisible: true } },
      { $sort: { "price.selling": 1 } },
      {
        $group: {
          _id: null,
          minPrice: { $first: "$price.selling" },
          maxPrice: { $last: "$price.selling" },
        },
      },
    ];
    let rangePriceResults = await service.aggregate(rangePriceQuery);
    filters.price.min = rangePriceResults[0]?.minPrice || 0;
    filters.price.max = rangePriceResults[0]?.maxPrice || 0;

    const project = {
      productTags: 1,
      name: 1,
      origin: 1,
      category: 1,
      overview: 1,
      details: 1,
      thumbnail: 1,
      isWishlisted: 1,
      prodid: 1,
      price: 1,
      slug: 1,
      style: 1,
      category: 1,
      product: 1,
      stock: 1,
      parentId: 1,
      attributes: 1,
      _id: 1,
    };

    if (category.length > 0 && !body?.collection) {
      let sort = {};
      let categoryIds = category.map((category) => {
        return category._id;
      });
      const AggregationPipeline = [
        {
          $match: {
            $or: [
              { "parent.catid": { $in: categoryIds } },
              { root: categoryIds },
            ],
            isActive: true,
            isDelete: false,
          },
        },
      ];

      let attributeQuery = [
        {
          $match: {
            "category.id": { $in: categoryIds },
            isActive: true,
            isDelete: false,
          },
        },
        {
          $unwind: "$attributes",
        },
        {
          $match: {
            "attributes.title": { $ne: "" },
            "attributes.value": { $ne: "" },
          },
        },
        {
          $group: {
            _id: "$attributes.title",
            attributes: {
              $addToSet: { attribute: "$attributes.value" },
            },
          },
        },
      ];

      let categories = await categoryService.getCategoriesWithAllChilds(
        AggregationPipeline
      );

      categories.forEach((item) => {
        categories = [...categories, ...item.childCategories];
      });

      const brands = await brandService.getBrands(
        { isActive: true, isDelete: false },
        { name: 1 }
      );
      for (let _brand of brands)
        filters.brands.push({ title: _brand?.name, slug: _brand?.slug });

      let query = {
        "category.id": { $in: categoryIds },
        isActive: true,
        isDelete: false,
      };

      if (body?.brands) {
        let productIds = [];
        for (let _brand of body?.brands) {
          const brand = await brandService.getBrand({
            slug: _brand,
            isActive: true,
            isDelete: false,
          });
          const products = await productHeadService.find({
            brand: brand?._id,
          });
          for (let product of products)
            if (!productIds.includes(product?.id))
              productIds.push(product?._id);
        }
        query["product.id"] = { $in: productIds };
      }

      if (body?.sort) {
        switch (body?.sort) {
          case "0":
            sort = { "price.selling": 1 };
            break;
          case "1":
            sort = { "price.selling": -1 };
            break;
          case "2":
            sort = { createdAt: -1 };
            break;
          case "3":
            sort = { createdAt: 1 };
          case "4":
            sort = { name: -1 };
            break;
          case "5":
            sort = { name: 1 };
        }
      }

      if (body?.search?.length > 0) {
        query.$or = [{ name: { $regex: new RegExp(body?.search, "i") } }];
      }

      if (body?.priceFrom && !body?.priceTo) {
        query["price.selling"] = { $gte: Number(body?.priceFrom) };
      }

      if (body?.priceTo && !body?.priceFrom) {
        query["price.selling"] = { $lte: Number(body?.priceTo) };
      }

      if (body?.priceFrom && body?.priceTo) {
        query["$and"] = [
          { "price.selling": { $gte: Number(body?.priceFrom) } },
          { "price.selling": { $lte: Number(body?.priceTo) } },
        ];
      }

      let priceQuery = [
        {
          $sort: { "price.selling": 1 },
        },
        {
          $match: {
            "category.id": { $in: categoryIds },
            isActive: true,
            isDelete: false,
          },
        },
        {
          $group: {
            _id: null,
            lowestPrice: { $first: "$price.selling" },
            highestPrice: { $last: "$price.selling" },
          },
        },
      ];

      if (body?.origin?.length > 0) {
        query["origin"] = { $in: body?.origin };
        priceQuery.unshift({ $match: { origin: { $in: body?.origin } } });
        attributeQuery.unshift({ $match: { origin: { $in: body?.origin } } });
      }

      if (body?.attributes?.length > 0) {
        query["attributes"] = {
          $all: body.attributes.map((attr) => ({ $elemMatch: attr })),
        };
      }

      const attributeResults = await service.aggregate(attributeQuery);
      const priceResults = await service.aggregate(priceQuery);

      filters.price.low = priceResults[0]?.lowestPrice;
      filters.price.high = priceResults[0]?.highestPrice;
      filters.attributes = attributeResults;

      !settings?.isOutOfStock
        ? (query["stock"] = { $gt: 0 })
        : (query["stock"] = { $gte: 0 });
      filters["type"] = "categories";

      // query['isVisible'] = true;
      results = await service.getProductListingWeb(
        query,
        project,
        body?.page,
        body?.limit,
        userid,
        deviceToken,
        sort
      );
      coCategories = results?.coCategories || [];
      minPrice = results?.addionalInfo?.minPrice || 0;
      maxPrice = results?.addionalInfo?.maxPrice || 0;
      response.products = results;
      response.headers.thumbnail = category?.file
        ? BASE_URL + category?.file
        : null;
      response.headers.cover = category?.banner
        ? BASE_URL + category?.banner
        : null;
      response.headers.title = category?.name;
    } else if (collection) {
      let sort = {};
      let results = [];
      let products = [];
      let query = {
        _id: { $in: products },
        isArchive: false,
        isDelete: false,
        isActive: true,
      };
      const collections = await collectionService.find({
        isDelete: false,
        isActive: true,
      });

      for (let _collection of collections) {
        filters.collections.push({
          title: _collection?.name,
          slug: _collection?.slug,
        });
      }

      for (let product of collection?.products) {
        const productStatus = product.isActive || false;
        if (productStatus) products.push(product?._id);
      }

      if (body?.brands) {
        let productIds = [];
        for (let _brand of body?.brands) {
          const brand = await brandService.getBrand({
            slug: _brand,
            isActive: true,
            isDelete: false,
          });
          const products = await productHeadService.find({
            brand: brand?._id,
          });
          for (let product of products)
            if (!productIds.includes(product?.id))
              productIds.push(product?._id);
        }
        query["product.id"] = { $in: productIds };
      }

      if (body?.sort) {
        switch (body?.sort) {
          case "0":
            sort = { "price.selling": 1 };
            break;
          case "1":
            sort = { "price.selling": -1 };
            break;
          case "2":
            sort = { createdAt: -1 };
            break;
          case "3":
            sort = { createdAt: 1 };
          case "4":
            sort = { name: -1 };
            break;
          case "5":
            sort = { name: 1 };
        }
      }

      if (body?.search?.length > 0) {
        query.$or = [{ name: { $regex: new RegExp(body?.search, "i") } }];
      }

      if (body?.priceFrom && !body?.priceTo) {
        query["price.selling"] = { $gte: Number(body?.priceFrom) };
      }

      if (body?.priceTo && !body?.priceFrom) {
        query["price.selling"] = { $lte: Number(body?.priceTo) };
      }

      if (body?.priceFrom && body?.priceTo) {
        query["$and"] = [
          { "price.selling": { $gte: Number(body?.priceFrom) } },
          { "price.selling": { $lte: Number(body?.priceTo) } },
        ];
      }

      let priceQuery = [
        {
          $sort: { "price.selling": 1 },
        },
        {
          $match: { _id: { $in: products }, isActive: true, isDelete: false },
        },
        {
          $group: {
            _id: null,
            lowestPrice: { $first: "$price.selling" },
            highestPrice: { $last: "$price.selling" },
          },
        },
      ];

      let attributeQuery = [
        {
          $match: { _id: { $in: products }, isActive: true, isDelete: false },
        },
        {
          $unwind: "$attributes",
        },
        {
          $match: {
            "attributes.title": { $ne: "" },
            "attributes.value": { $ne: "" },
          },
        },
        {
          $group: {
            _id: "$attributes.title",
            attributes: {
              $addToSet: { attribute: "$attributes.value" },
            },
          },
        },
      ];

      if (body?.origin?.length > 0) {
        query["origin"] = { $in: body?.origin };
        priceQuery.unshift({ $match: { origin: { $in: body?.origin } } });
        attributeQuery.unshift({ $match: { origin: { $in: body?.origin } } });
      }

      const attributeResults = await service.aggregate(attributeQuery);
      const priceResults = await service.aggregate(priceQuery);
      filters.price.low = priceResults[0]?.lowestPrice;
      filters.price.high = priceResults[0]?.highestPrice;
      filters.attributes = attributeResults;

      !settings?.isOutOfStock
        ? (query["stock"] = { $gt: 0 })
        : (query["stock"] = { $gte: 0 });
      filters["type"] = "collections";

      results = await service.getProductListingWeb(
        query,
        project,
        body?.page,
        body?.limit,
        userid,
        deviceToken,
        sort
      );
      coCategories = results?.coCategories || [];
      minPrice = results?.addionalInfo?.minPrice || 0;
      maxPrice = results?.addionalInfo?.maxPrice || 0;

      response.products = results;
      response.headers.thumbnail = collection?.file
        ? BASE_URL + collection?.file
        : null;
      response.headers.cover = collection?.banner
        ? BASE_URL + collection?.banner
        : null;
      response.headers.title = collection?.name;
    } else if (
      req?.body?.category?.length > 0 ||
      body?.collection?.length > 0
    ) {
      //Edge case for non existing category or collection
      response.products = {
        page: 1,
        per_page: 10,
        total_items: 0,
        product_items: [],
        addionalInfo: { minPrice: 0, maxPrice: 0 },
        last_page: true,
      };
    } else {
      let sort = {};
      let productIds = [];
      const brands = await brandService.getBrands(
        { isActive: true, isDelete: false },
        { name: 1 }
      );
      for (let _brand of brands) {
        filters.brands.push({ title: _brand?.name, slug: _brand?.slug });
      }

      let attributeQuery = [
        {
          $unwind: "$attributes",
        },
        {
          $match: {
            "attributes.title": { $ne: "" },
            "attributes.value": { $ne: "" },
          },
        },
        {
          $group: {
            _id: "$attributes.title",
            attributes: {
              $addToSet: { attribute: "$attributes.value" },
            },
          },
        },
      ];

      let query = { isActive: true, isDelete: false };

      if (body?.brands) {
        for (let _brand of body?.brands) {
          const brand = await brandService.getBrand({
            slug: _brand,
            isActive: true,
            isDelete: false,
          });
          const products = await productHeadService.find({ brand: brand?._id });
          for (let product of products) {
            if (!productIds.includes(product?.id)) {
              productIds.push(product?._id);
            }
          }
        }
        query["product.id"] = { $in: productIds };
        attributeQuery.unshift({
          $match: { "product.id": { $in: productIds } },
        });
      }

      if (body?.sort) {
        switch (body?.sort) {
          case "0":
            sort = { "price.selling": 1 };
            break;
          case "1":
            sort = { "price.selling": -1 };
            break;
          case "2":
            sort = { createdAt: -1 };
            break;
          case "3":
            sort = { createdAt: 1 };
          case "4":
            sort = { name: -1 };
            break;
          case "5":
            sort = { name: 1 };
        }
      }

      if (body?.search?.length > 0) {
        query.$or = [{ name: { $regex: new RegExp(body?.search, "i") } }];
      }

      if (body?.priceFrom && !body?.priceTo) {
        query["price.selling"] = { $gte: Number(body?.priceFrom) };
      }

      if (body?.priceTo && !body?.priceFrom) {
        query["price.selling"] = { $lte: Number(body?.priceTo) };
      }

      if (body?.priceFrom && body?.priceTo) {
        query["$and"] = [
          { "price.selling": { $gte: Number(body?.priceFrom) } },
          { "price.selling": { $lte: Number(body?.priceTo) } },
        ];
      }

      let priceQuery = [];
      productIds.length > 0
        ? (priceQuery = [
          { $sort: { "price.selling": 1 } },
          { $match: { "product.id": { $in: productIds } } },
          {
            $group: {
              _id: null,
              lowestPrice: { $first: "$price.selling" },
              highestPrice: { $last: "$price.selling" },
            },
          },
        ])
        : (priceQuery = [
          { $sort: { "price.selling": 1 } },
          {
            $group: {
              _id: null,
              lowestPrice: { $first: "$price.selling" },
              highestPrice: { $last: "$price.selling" },
            },
          },
        ]);

      if (body?.origin?.length > 0) {
        priceQuery.unshift({ $match: { origin: { $in: body?.origin } } });
        query["origin"] = { $in: body?.origin };
        attributeQuery.unshift({ $match: { origin: { $in: body?.origin } } });
      }

      const attributeResults = await service.aggregate(attributeQuery);
      const priceResults = await service.aggregate(priceQuery);

      filters.price.low = priceResults[0]?.lowestPrice;
      filters.price.high = priceResults[0]?.highestPrice;
      filters.attributes = attributeResults;

      !settings?.isOutOfStock
        ? (query["stock"] = { $gt: 0 })
        : (query["stock"] = { $gte: 0 });

      results = await service.getProductListingWeb(
        query,
        project,
        body?.page,
        body?.limit,
        userid,
        deviceToken,
        sort
      );

      coCategories = results?.coCategories || [];
      minPrice = results?.addionalInfo?.minPrice || 0;
      maxPrice = results?.addionalInfo?.maxPrice || 0;
      response.products = results;

      if (body?.brands && body?.brands.length == 1) {
        const brandDetails = await brandService.getBrand({
          slug: body.brands[0],
          isActive: true,
          isDelete: false,
        });
        response.headers.thumbnail = brandDetails?.thumbnail
          ? BASE_URL + brandDetails?.thumbnail?.path
          : null;
        response.headers.cover = brandDetails?.cover
          ? BASE_URL + brandDetails?.cover?.path
          : null;
        response.headers.description = brandDetails?.description;
        response.headers.title = brandDetails?.name;
      }
    }

    //category filtering coCategory listing
    let productsLengthLessThanZero =
      response?.products?.product_items?.length <= 0;
    if (
      (body?.category?.length > 0 || body?.collection) &&
      !productsLengthLessThanZero &&
      category.length > 0
    ) {
      response.filters.categories = coCategories || [];
    } else if (body?.collection?.length > 0) {
      response.filters.categories = coCategories || [];
    } else {
      const categories = await categoryService.getCategories(
        {},
        {},
        { name: 1 }
      );
      for (let _category of categories) {
        response.filters.categories.push({
          title: _category?.name,
          slug: _category?.slug,
        });
      }
    }

    //Handling price from and price to values for filtering ;
    if (body?.priceFrom && !body?.priceTo) {
      filters.price.low = body.priceFrom;
      filters.price.high = filters.price.high;
    } else if (body?.priceTo && !body?.priceFrom) {
      filters.price.low = filters.price.low;
      filters.price.high = body.priceTo;
    } else if (body?.priceFrom && body?.priceTo) {
      filters.price.low = body.priceFrom;
      filters.price.high = body.priceTo;
    }

    helper.deliverResponse(res, 200, response, {
      error_code: messages.successResponse.error_code,
      error_message: messages.successResponse.error_message,
    });
  } catch (error) {
    console.log("Error caught in product listing API :: " + error);
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

exports.products = async (req, res) => {
  const settings = await settingsService.findOne({});
  const { body } = req;

  let query = { isActive: true, isVisible: true, isDelete: false };
  let metaDetails = {
    title: "Products Listing",
    description: "All products available in the store are listed here.",
    keywords: "products, all products available, store products list",
  };

  let sort = { createdAt: -1 };
  switch (body?.sort) {
    case "default":
      sort = { createdAt: -1 };
      break;
    case "priceLowToHigh":
      sort = { "price.selling": 1 };
      break;
    case "priceHighToLow":
      sort = { "price.selling": -1 };
      break;
  }

  if (body?.category?.length > 0) query["category"] = { $in: body?.category };
  if (body.priceFrom || body.priceTo) {
    query["price.selling"] = {};
    if (body.priceFrom) query["price.selling"].$gte = body.priceFrom;
    if (body.priceTo) query["price.selling"].$lte = body.priceTo;
  }

  // Meta details for category page listing
  if (body?.category?.length == 1) {
    const category = await categoryService.findOne({ _id: body?.category[0] });
    metaDetails = {
      title: category?.metaTitle || "Products Listing",
      description:
        category?.metaDescription ||
        "All products available in the store are listed here.",
      keywords:
        category?.metaKeywords ||
        "products, all products available, store products list",
    };
  }

  try {
    const results = await service.getProductListing(
      query,
      {},
      body.page,
      body.limit,
      sort,
      settings
    );
    helper.deliverResponse(
      res, 200, {
      ...results,
      metaDetails: metaDetails,
    }, messages.successResponse);
  } catch (error) {
    console.log("Error caught in product listing API :: " + error);
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

exports.getProductFilters = async (req, res) => {
  try {
    let result;
    let filters = {};
    let pricerange = { low: 0, high: 0, max: 0, min: 0 };
    const attributes = await db.Product.aggregate([
      // Step 1: Match products that are active and not deleted
      {
        $match: {
          isActive: true,
          isDelete: false,
          // createdAt:-1
        },
      },

      // Step 2: Unwind the attributes array to access each attribute individually
      { $unwind: "$attributes" },

      // Step 3: Group by `attributes.title`, collecting unique values for each title
      {
        $group: {
          _id: "$attributes.title",
          values: { $addToSet: "$attributes.value" },
        },
      },

      // Step 4: Project the output to a more readable format
      {
        $project: {
          title: "$_id",
          values: 1,
          _id: 0,
        },
      },
    ]);

    let rangePriceQuery = [
      { $match: { isActive: true, isDelete: false, isVisible: true } },
      { $sort: { "price.selling": 1 } },
      {
        $group: {
          _id: null,
          minPrice: { $first: "$price.selling" },
          maxPrice: { $last: "$price.selling" },
        },
      },
    ];

    let rangePriceResults = await service.aggregate(rangePriceQuery);
    pricerange.min = rangePriceResults[0]?.minPrice || 0;
    pricerange.max = rangePriceResults[0]?.maxPrice || 0;

    filters.color = attributes?.find((item) => item.title === "Color");
    filters.sizes = attributes?.find((item) => item.title === "Size");
    filters.price = pricerange;
    result = { filters };

    // Respond with the aggregated filters
    res.status(200).json({ success: true, result });
  } catch (error) {
    console.error("Error fetching product filters:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch filters" });
  }
};

exports.getProductDetails = async (req, res) => {
  try {
    const { authorization, devicetoken } = req.headers;
    let userid = null;
    let deviceToken = null;
    if (authorization) {
      let token = authorization.split("Bearer ")[1];
      jwt.verify(token, key.JWTSECRET, (err, decoded) => {
        if (err) userid = null;
        userid = decoded?.userid;
      });
    } else {
      deviceToken = devicetoken;
    }

    const { body } = req;
    let query = { isActive: true, isDelete: false };
    if (body.keyword) query["slug"] = body?.keyword;
    if (body.parentId) query["parentId"] = body.parentId;
    if (body?.attributes) {
      let attributeItems = [];
      body.attributes.forEach((attribute) =>
        attributeItems.push({ $elemMatch: attribute })
      );
      query["attributes"] = { $all: attributeItems };
    }

    let response = await service.getProductDetails(
      query,
      {},
      userid,
      deviceToken
    );
    helper.deliverResponse(res, 200, response, {
      error_code: messages.successResponse.error_code,
      error_message: messages.successResponse.error_message,
    });
  } catch (error) {
    console.log("Error caught in product details API :: " + error);
    helper.deliverResponse(res, 422, error, {
      error_code: messages.serverError.error_code,
      error_message: messages.serverError.error_message,
    });
  }
};

exports.getRelatedProducts = async (req, res) => {
  const settings = await settingsService.findOne()
  const productDetails = await service.findOne({ slug: req.params.productId })
  if (!productDetails) {
    return helper.deliverResponse(res, 422, {}, messages.serverError);
  }

  const categoryIds = productDetails.category.map(categoryItem => categoryItem._id)

  const likedProductIds = await db.Product.find(
    {
      category: { $in: categoryIds },
      isActive: true,
      isDelete: false,
      isVisible: true,
      _id: { $ne: productDetails._id }
    }).limit(10)

  const likedProducts = likedProductIds.map((product) => {
    const productResponse = getProductResponse(product, settings);
    return productResponse
  })
  
  let relatedProducts = []
  
  if (productDetails.relatedProducts && productDetails.relatedProducts.length > 0) {
    const productItems = await service.find({ _id: { $in: productDetails.relatedProducts } })
    relatedProducts = productItems.map((product) => {
      const productResponse = getProductResponse(product, settings);
      return productResponse
    })
  }

  return helper.deliverResponse(res, 200, { likedProducts, relatedProducts }, messages.successResponse);
}

// exports.getSuggestions = async (req, res, next) => {
//   try {
//     const { authorization, devicetoken } = req.headers;
//     let userid = null;
//     let searchHistory = [];

//     if (authorization) {
//       jwt.verify(
//         authorization.split("Bearer ")[1],
//         key.JWTSECRET,
//         (err, decoded) => {
//           if (err) userid = null;
//           userid = decoded?.userid;
//         }
//       );
//       const customerDetails = await customerService.getCustomer({
//         userid: userid,
//         isDelete: false,
//       });
//       if (customerDetails) searchHistory = [...customerDetails?.searchHistory];
//     } else {
//       searchHistory = [];
//     }

//     const { search, delete: deleteTerm } = req.query;
//     const settings = await settingsService.findOne();
//     // Handle deletion of a specific term in search history
//     if (deleteTerm && searchHistory.includes(deleteTerm)) {
//       searchHistory = searchHistory.filter((item) => item !== deleteTerm);

//       // Update the user's search history in the database
//       if (userid) {
//         await customerService.updateCustomer(userid, { searchHistory });
//       }
//     }

//     const query = {
//       $or: [
//         { name: { $regex: `^${search}`, $options: "i" } },
//         { sku: { $regex: `^${search}`, $options: "i" } },
//       ],
//       isActive: true,
//       isDelete: false,
//     };

//     if (search && !searchHistory.includes(search)) {
//       searchHistory.unshift(search); // Add new search term at the beginning
//       if (searchHistory.length > 12) {
//         searchHistory.pop(); // Keep only the 3 most recent searches
//       }

//       // Update the search history for the user
//       if (userid) {
//         await customerService.updateCustomer(userid, { searchHistory });
//       }
//     }

//     let products = await service.getProductSuggestions(query, 1, 5, {
//       name: 1,
//       slug: 1,
//       thumbnail: 1,
//       _id: 0,
//     });
//     let productDetails = [];
//     for (let product of products) {
//       let message;
//       let offerExists = product?.offerExists || false;
//       if (offerExists) {
//         if (product?.price?.selling != product?.price?.mrp) {
//           const difference =
//             product?.price?.mrp - product?.price?.selling;
//           const percentageOff = Math.round(
//             (difference / product?.price?.mrp) * 100
//           );
//           message = { text: `Save ${percentageOff}%` };
//         }
//       }
  
      
//       productDetails.push({
//         name: product?.name,
//         slug: product?.slug,
//         thumbnail: BASE_URL + product?.thumbnail,
//         price: { text: `${settings?.currency} ${product?.price?.selling}` },
//         actualPrice: { text: `${settings?.currency} ${product?.price?.mrp}` },
//         overview: product?.overview,
//         percentageOff: message,
//         params: { slug: product?.slug },
//         donationPercentage: { text: `${product?.donationPercentage}% is Donated to Education` }
//       });
//     }
//     productDetails = productDetails.slice(0, 3);
//     searchHistory = searchHistory.slice(0, 3);

//     helper.deliverResponse(
//       res,
//       200,
//       {
//         suggestions: search ? productDetails : [],
//         searchHistory: searchHistory,
//       },
//       {
//         error_code: messages.successResponse.error_code,
//         error_message: messages.successResponse.error_message,
//       }
//     );
//   } catch (error) {
//     console.log("Error caught in get suggestions API :: " + error);
//     helper.deliverResponse(
//       res,
//       422,
//       {},
//       {
//         error_code: messages.serverError.error_code,
//         error_message: messages.serverError.error_message,
//       }
//     );
//   }
// };
exports.getSuggestions = async (req, res, next) => {
  try {
    const { authorization, devicetoken } = req.headers;
    let userid = null;
    let searchHistory = [];

    if (authorization) {
      jwt.verify(
        authorization.split("Bearer ")[1],
        key.JWTSECRET,
        (err, decoded) => {
          if (err) userid = null;
          userid = decoded?.userid;
        }
      );
      const customerDetails = await customerService.getCustomer({
        userid: userid,
        isDelete: false,
      });
      if (customerDetails) searchHistory = [...customerDetails?.searchHistory];
    } else {
      searchHistory = [];
    }

    const { search, delete: deleteTerm } = req.query;
    const settings = await settingsService.findOne();

    // Handle deletion of a specific term in search history
    if (deleteTerm && searchHistory.includes(deleteTerm)) {
      searchHistory = searchHistory.filter((item) => item !== deleteTerm);

      // Update the user's search history in the database
      if (userid) {
        await customerService.updateCustomer(userid, { searchHistory });
      }
    }

    // Modified search query to match partial words anywhere in name or SKU
    const query = {
      $or: [
        { name: { $regex: search, $options: "i" } },  // Removed ^ to match anywhere
        { sku: { $regex: search, $options: "i" } },   // Removed ^ to match anywhere
      ],
      isActive: true,
      isDelete: false,
    };

    if (search && !searchHistory.includes(search)) {
      searchHistory.unshift(search);
      if (searchHistory.length > 12) {
        searchHistory.pop();
      }

      if (userid) {
        await customerService.updateCustomer(userid, { searchHistory });
      }
    }

    let products = await service.getProductSuggestions(query, 1, 5, {
      name: 1,
      slug: 1,
      thumbnail: 1,
      _id: 0,
    });

    let productDetails = [];
    for (let product of products) {
      let message;
      let offerExists = product?.offerExists || false;
      if (offerExists) {
        if (product?.price?.selling != product?.price?.mrp) {
          const difference = product?.price?.mrp - product?.price?.selling;
          const percentageOff = Math.round(
            (difference / product?.price?.mrp) * 100
          );
          message = { text: `Save ${percentageOff}%` };
        }
      }

      productDetails.push({
        name: product?.name,
        slug: product?.slug,
        thumbnail: BASE_URL + product?.thumbnail,
        price: { text: `${settings?.currency} ${product?.price?.selling}` },
        actualPrice: { text: `${settings?.currency} ${product?.price?.mrp}` },
        overview: product?.overview,
        percentageOff: message,
        params: { slug: product?.slug },
        donationPercentage: { text: `${product?.donationPercentage}% is Donated to Education` }
      });
    }
    
    productDetails = productDetails.slice(0, 3);
    searchHistory = searchHistory.slice(0, 3);

    helper.deliverResponse(
      res,
      200,
      {
        suggestions: search ? productDetails : [],
        searchHistory: searchHistory,
      },
      {
        error_code: messages.successResponse.error_code,
        error_message: messages.successResponse.error_message,
      }
    );
  } catch (error) {
    console.log("Error caught in get suggestions API :: " + error);
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
const getHeaders = async (category = [], collection = "") => {  
  let response = {};
  if (category && category.length == 1) {
    const categoryDetails = await db.Category.findOne({ slug: category[0] });
    response.thumbnail = categoryDetails?.thumbnail
      ? BASE_URL + categoryDetails?.thumbnail
      : null;
    response.cover = categoryDetails?.cover
      ? BASE_URL + categoryDetails?.cover
      : null;
    response.title = categoryDetails?.name;
    response.metaTitle = categoryDetails?.metaTitle;
    response.metaDescription = categoryDetails?.metaDescription;
    response.metaKeywords = categoryDetails?.metaKeywords;
    return response;
  } else if (collection) {
    const collectionDetails = await db.Collection.findOne({ slug: collection });
    response.thumbnail = collectionDetails?.file
      ? BASE_URL + collectionDetails?.file
      : null;
    response.cover = collectionDetails?.banner
      ? BASE_URL + collectionDetails?.banner
      : null;
    response.title = collectionDetails?.name;
    response.metaTitle = collectionDetails?.metaTitle;
    response.metaDescription = collectionDetails?.metaDescription;
    response.metaKeywords = collectionDetails?.metaKeywords;
    return response;
  } else {
    return {
      thumbnail: "",
      cover: "",
      title: "",
      description: "",
      metaDescription: "",
      metaTitle: "",
      metaKeywords: "",
    };
  }
};

exports.newPlp = async (req, res) => {
  const { body } = req;
  let matchQuery = { isActive: true, isDelete: false, isVisible: true },
    sort = {};
  const settings = await settingsService.findOne();

  if (body.category && body.category.length) {
    // matchQuery["categories.slug"] = { $in: body.category };
    const categoryIds = await db.Category.find(
      { slug: { $in: body.category } }, // Resolve slugs
      { _id: 1 }
    ).lean();
    matchQuery["category"] = { $in: categoryIds.map(cat => cat._id) };
  }
  let collections
  if(body.collection?.length){
     collections= await db.Collection.find(
      {slug:{$in:body.collection}}
    ).lean();
    const collectionProductIds = collections.flatMap(collection => collection.products);
    matchQuery["_id"] = { $in: collectionProductIds };
  }

  if (body.attributes && body.attributes.length) {
    matchQuery["attributes"] = {
      $all: body.attributes.map((attr) => ({ $elemMatch: attr })),
    };
  }

  if (body?.discount) {
    let discountQuery = {
      $expr: {
        $gte: [
          {
            $divide: [
              { $subtract: ["$price.mrp", "$price.selling"] },
              "$price.mrp",
            ],
          },
          body.discount / 100,
        ],
      },
    };

    matchQuery = { ...matchQuery, ...discountQuery };
  }

  if (body.search) {
    matchQuery["$or"] = [
      { name: { $regex: body.search, $options: "i" } },
      { sku: { $regex: body.search, $options: "i" } },
      // { searchKeywords: { $regex: body.search, $options: "i" } },
      // { metaTitle: { $regex: body.search, $options: "i" } },
      // { metaKeywords: { $regex: body.search, $options: "i" } },
      // { metaDescription: { $regex: body.search, $options: "i" } },
    ];
  }

  if (body.priceFrom && !body.priceTo) {
    matchQuery["price.selling"] = { $gte: Number(body.priceFrom) };
  }

  if (body.priceTo && !body.priceFrom) {
    matchQuery["price.selling"] = { $lte: Number(body.priceTo) };
  }

  if (body.priceFrom && body.priceTo) {
    matchQuery["price.selling"] = {
      $gte: Number(body.priceFrom),
      $lte: Number(body.priceTo),
    };
  }

  if (body.sort) {
    switch (body.sort) {
      case "0":
        sort = { "price.selling": 1 };
        break;
      case "1":
        sort = { "price.selling": -1 };
        break;
      case "2":
        sort = { createdAt: -1 };
        break;
      case "3":
        sort = { createdAt: 1 };
      case "4":
        sort = { name: -1 };
        break;
      case "5":
        sort = { name: 1 };
      default:
        sort = {};
    }
  }

  let aggregate = [
    {
      $match: {
        isDelete: false,
        isActive: true,
        // isVisible: true,
      },
    },
    {
      $sort: { ...sort },
    },
    {
      $facet: {
        products: [
          { $match: matchQuery },
          { $skip: (body.page - 1) * body.limit },
          { $limit: body.limit },
        ],
        categories: [
          { $match: matchQuery },
          {
            $lookup: {
              from: "categories", // collection name to join with
              localField: "category", // field in the products document
              foreignField: "_id", // field in the categories collection
              as: "categoryDetails", // alias for the joined categories
            },
          },
          {
            $unwind: {
              path: "$categoryDetails",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $group: {
              _id: {
                title: "$categoryDetails.name",
                slug: "$categoryDetails.slug",
              },
            },
          },
          { $project: { _id: 0, title: "$_id.title", slug: "$_id.slug" } },
          { $sort: { title: 1 } },
        ],
        attributes: [
          { $unwind: "$attributes" },
          {
            $match: {
              "attributes.title": { $ne: "" },
              "attributes.value": { $ne: "" },
            },
          },
          {
            $group: {
              _id: "$attributes.title",
              attributes: { $addToSet: { attribute: "$attributes.value" } },
            },
          },
          {
            $addFields: {
              attributes: {
                $map: {
                  input: {
                    $sortArray: {
                      input: "$attributes",
                      sortBy: { attribute: 1 },
                    },
                  }, // Sort alphabetically by attribute value
                  as: "item",
                  in: "$$item",
                },
              },
            },
          },
        ],
        price: [
          { $match: { isActive: true, isDelete: false, isVisible: true } },
          { $sort: { "price.selling": 1 } },
          {
            $group: {
              _id: null,
              min: { $first: "$price.selling" },
              max: { $last: "$price.selling" },
            },
          },
        ],
        priceRange: [
          { $match: matchQuery },
          { $sort: { "price.selling": 1 } },
          {
            $group: {
              _id: null,
              low: { $first: "$price.selling" },
              high: { $last: "$price.selling" },
            },
          },
        ],
        totalProducts: [{ $match: matchQuery }, { $count: "count" }],
      },
    },
    {
      $addFields: {
        productsData: {
          page: body.page,
          per_page: body.limit,
          total_items: { $arrayElemAt: ["$totalProducts.count", 0] },
          last_page: {
            $cond: {
              if: {
                $lte: [
                  { $arrayElemAt: ["$totalProducts.count", 0] },
                  {
                    $add: [
                      { $multiply: [body.page - 1, body.limit] },
                      { $size: "$products" },
                    ],
                  },
                ],
              },
              then: true,
              else: false,
            },
          },
          product_items: "$products",
        },
      },
    },
    {
      $project: {
        products: "$productsData",
        filters: {
          categories: "$categories",
          attributes: "$attributes",
          price: "$price",
          priceRange: "$priceRange",
          collections: [],
        },
      },
    },
  ];

  const [headerDetails, aggregateResponse] = await Promise.all([
    getHeaders(body.category, body.collection),
    service.aggregate(aggregate),
  ]);

  let filters = aggregateResponse[0]["filters"];
  let productDetails = aggregateResponse[0]["products"];
  let productItems = [];

  filters.price = {
    min:
      (filters["price"] &&
        filters["price"].length > 0 &&
        filters["price"][0]["min"]) ||
      0,
    max:
      (filters["price"] &&
        filters["price"].length > 0 &&
        filters["price"][0]["max"]) ||
      0,
    low:
      (filters["priceRange"] &&
        filters["priceRange"].length > 0 &&
        filters["priceRange"][0]["low"]) ||
      0,
    high:
      (filters["priceRange"] &&
        filters["priceRange"].length > 0 &&
        filters["priceRange"][0]["high"]) ||
      0,
  };

  if (filters.origins && filters.origins.length > 0) {
    const origins = filters.origins[0];
    filters.origins = origins.filter(
      (origin) => Object.keys(origin).length > 0
    );
  }

  productDetails.product_items = await Promise.all(
    productDetails.product_items.map(async (product) => {
      return {
        ...product,
        attributesItems: await getAttributes(product.parentId),
      };
    })
  );

  productDetails.product_items.forEach((product) => {
    let productIcons = product?.productIcons;
    if (product.collections && product.collections.length > 0) {
      product.collections.forEach(
        (collection) => (productIcons = [...productIcons, ...collection.icons])
      );
    }

    productIcons = productIcons?.map(
      (icon) => `${process.env.BASE_URL}${icon}`
    );
    const response = getProductResponse(
      product,
      settings,
      process.env.BASE_URL,
      productIcons,
      product.attributesItems,
      collections
    );

    productItems.push(response);
  });

  return helper.deliverResponse(
    res,
    messages.success,
    {
      filters,
      products: {
        ...productDetails,
        product_items: productItems,
      },
      headers: headerDetails,
    },
    {
      error_code: messages.successResponse.error_code,
      error_message: messages.successResponse.error_message,
    }
  );
};

exports.getPopularSearches = async (req, res, next) => {
  try {
    // Aggregate search history from all customers and count occurrences
    // const popularSearches = await customerService.aggregate([
    //   { $match: { isDelete: false } }, // Only include non-deleted customers
    //   { $unwind: "$searchHistory" },   // Unwind search history array to individual entries
    //   { $group: { _id: "$searchHistory", count: { $sum: 1 } } }, // Count occurrences of each term
    //   { $sort: { count: -1 } },        // Sort by count in descending order
    //   { $limit: 5 }                   // Limit results to top 5 most popular searches
    // ]);
    const popularSearches = [
      { _id: "Leggins", count: 5 },
      { _id: "Shorts", count: 4 },
      { _id: "Sports Bra", count: 3 },
      { _id: "Medium Rise", count: 2 },
      
    ];
    const popularSearchArray = popularSearches.map(search => ({
      text: search.text,
      count: search.count,
    }));
   

    // Send response with popular searches
    helper.deliverResponse(
      res,
      200,
      { popularSearches: popularSearchArray },
      {
        error_code: messages.successResponse.error_code,
        error_message: messages.successResponse.error_message,
      }
    );
  } catch (error) {
    console.log("Error caught in get popular searches API :: " + error);
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

