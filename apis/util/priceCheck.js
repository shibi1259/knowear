const offerService = require("../app/services/offer.service")
const collectionService = require("../app/services/collection.service")

exports.productPriceCheck = async (product, productName, category, collection, prices, sellingprice) => {
  try {
    let leastamount = 0

    const offers_product = await offerService.find({
      products: { $in: [product] },
      isActive: true,
      isDelete: false,
      fromDate: { $lte: new Date(new Date().setUTCHours(0, 0, 0, 0)) },
      lastDate: { $gte: new Date(new Date().setUTCHours(0, 0, 0, 0)) },
    });

    const offers_category = await offerService.find({
      categories: { $in: category },
      isActive: true,
      isDelete: false,
      fromDate: { $lte: new Date(new Date().setUTCHours(0, 0, 0, 0)) },
      lastDate: { $gte: new Date(new Date().setUTCHours(0, 0, 0, 0)) },
    });

    const collections = await collectionService.find({
      products: { $in: [product] },
      isActive: true,
      isDelete: false,
      isArchive: false,
    });

    for (let col of collections) {
      if (!collection.includes(col._id)) {
        collection.push(col._id);
      }
    }

    const offers_collection = await offerService.find({
      collections: { $in: collection },
      isActive: true,
      isDelete: false,
      fromDate: { $lte: new Date(new Date().setUTCHours(0, 0, 0, 0)) },
      lastDate: { $gte: new Date(new Date().setUTCHours(0, 0, 0, 0)) },
    });

    if (offers_product.length > 0) {
      for (let offer of offers_product) {
        let discount = "";
        if (offer["type"] == "%") {
          discount = sellingprice - sellingprice * Number(offer["value"] / 100);
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
          discount = sellingprice - sellingprice * Number(offer["value"] / 100);
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
          discount = sellingprice - sellingprice * Number(offer["value"] / 100);
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
    console.log(`Calculated least amount for ${productName}`);
    return leastamount
  } catch (error) {
    console.log('Error caugh while checking product price :: ' + error);
    return error
  }
}