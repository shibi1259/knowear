const offerService = require("../app/services/offer.service");
const productService = require("../app/services/product.service");
const productHeadService = require("../app/services/product.head.service");
const collectionService = require("../app/services/collection.service");
const { applyOffersStoreLevel } = require("./offerEngineStoreLevel");
const db= require("../app/db")
// exports.getOffers = async () => {
//     try {
//         let globalOfferExists = false;
//         globalOfferExists = await applyOffersStoreLevel()
//         let productIds = []
//         console.log('Offer engine triggered at :: ' + new Date().toLocaleString())
//         let offers = await offerService.find({ isDelete: false, isActive: true, offerCategory: 'partial' });
//         console.log("offers",offers)

//         const currentDate = new Date();
//         const filteredOffers = offers.filter((offer) => {
//             const startDate = new Date(offer.startDate);
//             const endDate = new Date(offer.endDate);
//             return startDate <= currentDate && endDate >= currentDate;
//         });
//         offers = filteredOffers;


//         for (let offer of offers) {
//             let products = []
//             if (offer?.products) {
//                 products = offer?.products
//             } else if (offer?.collections) {
//                 for (let collection of offer?.collections) {
//                     const collectionDetails = await collectionService.findOne({ _id: collection })
//                     for (let product of collectionDetails?.products) if (!products.includes(product?._id)) products.push(product?._id)
//                 }
//             } else if (offer?.brands) {
//                 for (let brand of offer?.brands) {
//                     const productHeadDetails = await productHeadService.find({ brand: brand, isDelete: false, isActive: true })
//                     for (let productHead of productHeadDetails) {
//                         const productDetails = await productService.find({ 'product.id': productHead?._id, isDelete: false, isActive: true })
//                         for (let product of productDetails) if (!products.includes(product?._id)) products.push(product?._id)
//                     }
//                 }
//             } else if (offer?.categories) {
//                 for (let category of offer?.categories) {
//                     const productDetails = await productService.find({ 'category.id': { $in: [category] }, isDelete: false, isActive: true })
//                     for (let product of productDetails) {
//                         if (!products.includes(product?._id)) products.push(product?._id)
//                     }
//                 }
//             }

//             // console.log("products data   to be  displayed ",products)

//             for (let product of products) {
          
//                 const productDetails = await productService.getSingleProduct({ _id: product })
//                 let offerPrice = 0;
//                 switch (offer?.type) {
//                     case 'percentage':
//                         offerPrice = productDetails?.price?.offer - (productDetails?.price?.offer * (Number(offer?.offerAmount) / 100))
//                         break;
//                     case 'fixed':
//                         productDetails?.price?.offer > Number(offer?.offerAmount) ?
//                             offerPrice = productDetails?.price?.offer - Number(offer?.offerAmount) : offerPrice = productDetails?.price?.offer
                            
//                         break;
//                 }
//                 if (offerPrice <= 0) {
//                     offerPrice = productDetails?.price?.offer;
//                 }

//                 await productService.update(productDetails?.prodid, { 'price.selling': parseFloat(offerPrice.toFixed(2)), offerExists: true })
//                 if (!productIds.includes(product)) productIds.push(product)
//             }
//         }

//         let productsToUpdate = []
//         console.log("productIds",productIds,globalOfferExists)
//         productIds.length > 0 ? productsToUpdate = await productService.aggregate([{
//             '$match': { '_id': { '$nin': productIds } },
//         }]) : []
  
//         const allProducts = await productService.find({ isDelete: false, isActive: true });
//         for (let product of allProducts) {
//             let hasOffer = false;
//             productIds.forEach((item) => {
//                 if (item.toString() == product?._id?.toString()) {
//                     hasOffer = true
//                 }
//             })
//             // if (!globalOfferExists && !hasOffer) {
//             //     await productService.update({ _id: product._id }, { 'price.selling': product?.price?.offer, offerExists: false });
                
//             // }
//         }
//     } catch (error) {
//         console.error(`Error caught in offer engine at ${new Date().toLocaleString()} :: ` + error)
//     }
// }

exports.getOffers = async () => {
  try {
   

    let globalOfferExists = await applyOffersStoreLevel();
   

    // Fetch all partial offers
    let offers = await offerService.find({
      isDelete: false,
      isActive: true,
      offerCategory: "partial",
    });
  
    const currentDate = new Date();
    let activeOffers = [];
    let activeProductIds = new Set();
    let expiredProductIds = new Set();
    
    offers.forEach((offer) => {
      const startDate = new Date(offer.startDate);
      const endDate = new Date(offer.endDate);
   
      const isWithinRange = currentDate >= startDate && currentDate <= endDate;
    
      if (offer.isActive === true && isWithinRange) {
      
        activeOffers.push(offer);
        if (offer.products && Array.isArray(offer.products)) {
          offer.products.forEach((id) => activeProductIds.add(id.toString()));
        }
      } else {
        
        // Consider anything outside the valid range as expired or inactive
        if (offer.products && Array.isArray(offer.products)) {
          offer.products.forEach((id) => expiredProductIds.add(id.toString()));
        }
      }
    });
    
   
    

    // Remove active product IDs from expired ones (to prevent overlap)
    activeProductIds.forEach(id => expiredProductIds.delete(id));

    const expiredProductIdsArray = [...expiredProductIds];
    console.log("Expired product IDs for cleanup:", expiredProductIdsArray);

    // Always clean expired offers
    console.log("Cleaning up offers for", expiredProductIdsArray.length, "products");
    await cleanupExpiredOffers(expiredProductIdsArray);

    // Only reset product flags if no global offer is active
    if (!globalOfferExists) {
      await cleanupProducts(expiredProductIdsArray);
    }

    console.log("Offer engine completed successfully.");
  } catch (error) {
    console.error(
      `Error caught in offer engine at ${new Date().toLocaleString()} :: `,
      error
    );
  }
};



  // Corrected cleanupProducts function
  const cleanupProducts = async (productIdsWithOffers) => {
    try {
      console.log("Cleaning up products without active offers");
  
      const productIdsStrings = productIdsWithOffers.map(id =>
        typeof id === 'object' ? id.toString() : id
      );
  
      // Step 1: Reset offer flags
      const result = await db.Product.updateMany(
        {
          _id: { $nin: productIdsStrings },
          offerExists: true
        },
        {
          $set: {
            offerExists: false,
            offerSaleTime: '',
            offerEndTime: ''
          }
        }
      );
  
      // Step 2: Reset selling price to offer price if available
      const productsToReset = await db.Product.find({
        _id: { $nin: productIdsStrings },
        offerExists: true
      });
         
      for (const product of productsToReset) {
        if (product.price && product.price.offer) {
          await db.Product.updateOne(
            { _id: product._id },
            {
              $set: {
                "price.selling": product.price.offer
              }
            }
          );
        }
      }
  
      console.log(`Cleanup completed. Updated products: ${result.modifiedCount}`);
    } catch (error) {
      console.error("Error in cleanupProducts:", error);
    }
  };
  
  
  // Ensure cleanupExpiredOffers can work with all types of IDs
  // const cleanupExpiredOffers = async (productIdsWithOffers) => {
  //   try {
  //     console.log("Cleaning up expired offers");
  //     const currentDate = new Date();
  
  //     const productsWithOffers = await db.Product.find({
  //       offerExists: true
  //     });
  // console.log("productsWithOffers",productIdsWithOffers)

  //     // const expiredOfferProducts = productsWithOffers.filter(product => {
  //     //   const isOfferExpired = product.offerEndTime && new Date(product.offerEndTime) < currentDate;
  //     //   return isOfferExpired;
  //     // });
  //     console.log("expiredProductIds from the atad",expiredOfferProducts)
  //     const expiredProductIds = expiredOfferProducts.map(product => product._id);

  //     if (expiredProductIds.length > 0) {
  //       for (const productId of expiredProductIds) {
  //         const product = await db.Product.findById(productId);
  //         if (product && product.price && product.price.mrp) {
  //           await db.Product.updateOne(
  //             { _id: productId },
  //             {
  //               $set: {
  //                 offerExists: false,
  //                 offerSaleTime: '',
  //                 offerEndTime: '',
  //                 "price.selling": product.price.mrp
  //               }
  //             }
  //           );
  //         }
  //       }
  
  //       console.log(`Cleanup completed. Updated products with expired offers: ${expiredProductIds.length}`);
  //     } else {
  //       console.log("No products with expired offers found.");
  //     }
  //   } catch (error) {
  //     console.error("Error in cleanupExpiredOffers:", error);
  //   }
  // };
  
  
  const cleanupExpiredOffers = async (productIdsWithOffers) => {
    try {
      console.log("Cleaning up expired offers");
      console.log("Product IDs to update:", productIdsWithOffers);
  
      if (!productIdsWithOffers || productIdsWithOffers.length === 0) {
        console.log("No product IDs provided for update.");
        return;
      }
  
      for (const productId of productIdsWithOffers) {
        const product = await db.Product.findById(productId);
        if (product && product.price && product.price.mrp) {
          await db.Product.updateOne(
            { _id: productId },
            {
              $set: {
                offerExists: false,
                offerSaleTime: '',
                offerEndTime: '',
                "price.selling": product.price.mrp
              }
            }
          );
        }
      }
  
      console.log(`Cleanup completed. Updated products: ${productIdsWithOffers.length}`);
    } catch (error) {
      console.error("Error in cleanupExpiredOffers:", error);
    }
  };
  