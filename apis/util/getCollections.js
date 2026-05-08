const collectionService = require("../app/services/collection.service");

async function getCollectionsByProductId(productId) {
  try {
    // Find all collections where the products array contains the provided productId
    // let query ={ products: productId ,isActive: true,isDeleted: false};
    const query = { products: productId, isActive: true, isDeleted: false};


    const collections = await collectionService.getCollectionIds({});
    let collectionIds =[];
    collections.forEach((item)=>{
        if(item?.products?.includes(productId)){collectionIds.push(item?._id)}
      } )   


    return collectionIds;
  } catch (error) {
    console.error('Error retrieving collections:', error);
    throw error;
  }
}

module.exports = {
  getCollectionsByProductId,
};