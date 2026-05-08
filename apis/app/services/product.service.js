const db = require("../db");
const settingsService = require("./general.settings.service");
const { getAttributes } = require("../../util/getAttributes");
const { getProductResponse } = require("../../util/productResponse");

exports.create = async (data) => {
  try {
    let response = new db.Product(data);
    await response.save();
    return response;
  } catch (error) {
    throw error;
  }
};

exports.findOne = async (query, projection = {}) => {
  try {   
    let response = await db.Product.findOne(query, projection).populate(
      "category"
    );
    return response;
  } catch (error) {
    throw error;
  }
};

exports.update = async (query, data) => {
  try {
    let response = await db.Product.updateOne(
      query,
      { $set: data },
      {
        new: true,
        upsert: false,
        useFindAndModify: false,
      }
    ).exec();
    return response;
  } catch (error) {
    throw error;
  }
};

exports.find = async (query, projection = {}, sort = { createdAt: -1 }) => {
  try {
    let response = await db.Product.find(query, projection)
      .sort(sort)
      .populate("category")
      .populate({ path: "product", populate: { path: "tax" } })
      .populate("relatedProducts")
    return response;
  } catch (error) {
    throw error;
  }
};

exports.aggregate = async (query) => {
  try {
    let response = await db.Product.aggregate(query);
    return response;
  } catch (error) {
    throw error;
  }
};

exports.count = async (query, projection = {}) => {
  try {
    let response = await db.Product.find(query, projection).countDocuments();
    return response;
  } catch (error) {
    throw error;
  }
};

exports.search = async (
  query,
  page,
  limit,
  projection = {},
  sort = { createdAt: -1 }
) => {
  try {
    let response = await db.Product.find(query, projection)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(sort)
      .populate("category");
    let count = await db.Product.find(query).countDocuments();
    let result = {
      totalResults: count,
      totalPages: Math.ceil(count / limit) == 0 ? 1 : Math.ceil(count / limit),
      page: page,
      limit: limit,
      data: response,
      isLastPage: count > limit * count ? false : true,
    };
    return result;
  } catch (error) {
    throw error;
  }
};

exports.deleteMany = async (query) => {
  try {
    let response = await db.Product.updateMany(query, { isDelete: true });
    return response;
  } catch (error) {
    throw error;
  }
};

exports.deleteOne = async (query) => {
  try {
    let response = await db.Product.updateOne(query, { isDelete: true });
    return response;
  } catch (error) {
    throw error;
  }
};

exports.getProductListing = async (
  query,
  projection,
  page,
  limit,
  sort = {},
  settings = {}
) => {
  try {
    let products = await db.Product.find(query, projection)
      .sort(sort)
      .collation({ locale: "en", strength: 2 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    let count = await db.Product.find(query).countDocuments();
    let productItems = [];

    for (let product of products) {
      const productResponse = getProductResponse(product, settings);
      productItems.push(productResponse);
    }

    return {
      page: page,
      limit: limit,
      totalResults: count,
      totalPages: Math.ceil(count / limit) == 0 ? 1 : Math.ceil(count / limit),
      products: productItems,
      isLastPage: count > limit * page ? false : true,
    };
  } catch (error) {
    throw error;
  }
};

exports.getProductDetails = async (query, projection, userid, devicetoken) => {
  try {
    const settings = await settingsService.findOne({});
    // Optimized query - reduced populates from 4 to 2 essential ones and added lean() for better performance
    let productDetails = await db.Product.findOne(query, projection)
      .populate("category")
      .populate("product")
      .lean(); // Returns plain JavaScript objects instead of Mongoose documents

    if (productDetails) {
      let message = {};
      let medias = [];
      let relatedProducts = [];

      //Check if offer exists and calculate the percentage off
      let offerExists = productDetails?.offerExists || false;
      if (offerExists) {
        if (productDetails?.price?.selling != productDetails?.price?.mrp) {
          let difference =
            productDetails?.price?.mrp - productDetails?.price?.selling;
          const percentageOff = Math.round(
            (difference / productDetails?.price?.mrp) * 100
          );
          message = { text: `Save ${percentageOff}%` };
        }
      }

      for (let file of productDetails?.files) {
        medias.push({
          type: "image",
          url: `${process.env.BASE_URL}${file}`,
          zoomimage: `${process.env.BASE_URL}${file}`,
        });
      }
      if (productDetails?.video) {
        let zoomImage = `http://img.youtube.com/vi/${
          productDetails["video"]?.split("?si=")[1]
        }/default.jpg`;
        medias.push({
          type: "video",
          url: productDetails?.video,
          zoomimage: zoomImage,
        });
      }

      if (productDetails["relatedProducts"].length > 0) {
        for (let productDetail of productDetails["relatedProducts"]) {
          const productResponse = getProductResponse(productDetail, settings);
          relatedProducts.push(productResponse);
        }
      }

      const attributeItems = await getAttributes(productDetails?.parentId);


      return {
        metaDetails: {
          metaTitle: productDetails?.metaTitle,
          metaDescription: productDetails?.metaDescription,
          metaKeywords: productDetails?.metaKeywords,
          ogImage: productDetails?.ogImage,
          xTag: productDetails?.xTag,
          canonicalUrl: productDetails?.canonicalUrl,
        },
        productDetails: {
          thumbnail: `${process.env.BASE_URL}${
            productDetails?.thumbnail ? productDetails?.thumbnail : ""
          }`,
          hoverThumbnail: `${process.env.BASE_URL}${productDetails?.hoverThumbnail}`,
          params: { _id: productDetails?._id, slug: productDetails?.slug },
          medias: medias,
          sku: productDetails?.sku,
          percentageOff: message,
          save: {
            text:
              productDetails?.price?.mrp - productDetails?.price?.selling > 0
                ? `${settings?.currency} ${
                    (productDetails?.price?.mrp - productDetails?.price?.selling)?.toFixed(2)
                  }`
                : null,
          },
          name: { text: productDetails?.name },
          price: {
            text: `${settings?.currency} ${Number(productDetails?.price?.selling).toFixed(2)}`,
          },
          actualPrice: {
            text: productDetails?.price?.mrp === productDetails?.price?.selling 
              ? null 
              : `${settings?.currency} ${productDetails?.price?.mrp}`,
          },
          // actualPrice: {
          //   text: `${settings?.currency} ${productDetails?.price?.mrp}`,
          // },
          donationPercentage: {
            text: `${productDetails?.donationPercentage}% is Donated to Education`,
          },
          stock: productDetails?.stock > 0 ? "In Stock" : "Out of Stock",
          inStock: productDetails?.stock > 0 ? true : false,
          overview: { text: productDetails?.overview },
          description: { text: productDetails?.details?.description },
          sizeChart: { text: productDetails?.details?.sizeChart ? `${process.env.BASE_URL}${productDetails?.details?.sizeChart}` : null },
          returnPolicy: { text: productDetails?.details?.returnPolicy },
          unit: productDetails?.unit,
          parentId: productDetails?.parentId,
          attributes: productDetails?.attributes,
          attributeItems: attributeItems,
          relatedProducts: relatedProducts,
        },
      };
    }

    return null;
  } catch (error) {
    throw error;
  }
};

exports.getSingleProduct = async (query) => {
  try {
    let product = await db.Product.findOne(query)
      .populate([{ path: "thumbnail" }, { path: "files" }]);
    return product;
  } catch (error) {
    console.log(error);
  }
};

exports.updateProduct = async (prodid, data) => {
  try {
    let product = await db.Product.findOneAndUpdate(
      { _id: prodid },
      { $set: data },
      {
        new: true,
        upsert: false,
        useFindAndModify: false,
      }
    ).exec();
    return product;
  } catch (error) {
    console.log("AASD", error);

    throw error;
  }
};

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

    const { search } = req.query;
    const query = {
      $or: [
        { name: { $regex: `^${search}`, $options: "i" } },
        { sku: { $regex: `^${search}`, $options: "i" } },
      ],
      isActive: true,
      isDelete: false,
      isArchive: false,
      isVisible: true,
    };

    let products = await service.getProductSuggestions(query, 1, 5, {
      name: 1,
      slug: 1,
      thumbnail: 1,
      _id: 0,
    });

    let productDetails = [];
    for (let product of products) {
      productDetails.push({
        name: product?.name,
        slug: product?.slug,
        thumbnail: BASE_URL + product?.thumbnail?.path,
      });
    }

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

exports.getProductSuggestions = async (query, page, limit, project = {}) => {
  try {
    let product = await db.Product.find(query, project)
      .limit(limit * 1)
      .select(
        "name thumbnail slug price overview offerExists donationPercentage"
      )
      .skip((page - 1) * limit);
    return product;
  } catch (error) {
    throw error;
  }
};

exports.findByIdAndUpdate = async (prodid, data) => {
  try {
    let product = await db.Product.findByIdAndUpdate(
      prodid,
      { ...data },
      {
        new: true,
        upsert: false,
        useFindAndModify: false,
      }
    ).exec();
    return product;
  } catch (error) {
    console.log(error)
  }
};

exports.getProductItems = async (query, projection = {}) => {
  try {
    let products = await db.Product.find(query, projection)
      .sort({ createdtAt: -1 })
      .populate("category.id", "name")
      .populate("relatedProducts", "name")
      .populate({
        path: "product.id",
        populate: { path: "tax", select: "_id name rate" },
        select: "_id name brand return shipping cod",
      })
      .populate({
        path: "product.id",
        populate: { path: "brand", select: "_id name" },
        select: "_id name brand return shipping cod",
      })
      .populate({
        path: "product.id",
        populate: { path: "parentCategory.id", select: "_id name" },
        select: "_id name brand return shipping cod",
      });
    return products;
  } catch (error) {
    console.log(error)
  }
};