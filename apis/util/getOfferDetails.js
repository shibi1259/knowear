const OfferService = require("../app/services/offer.service");
async function getOfferData() {
    try {
        
        const result = await OfferService.getSpecificOffers()
        
        let output= {
            categories:{},
            products:{},
            collections:{},
            brands:{}
        }
        
        //storing all categories and their curresponding offers list
        result[0]?.categories.forEach(category => {
            output.categories[category.category_id] = category?.offers;
        });

        // //storing all direct products _ids and their curresponding offers list
        result[0]?.products.forEach(product => {
            output.products[product.product_id] = product?.offers;
        });

        // //storing all collections _ids and their curresponding offers list
        result[0]?.collections.forEach(collection => {
            output.collections[collection.collection_id] = collection?.offers;
        });

        // //storing all brands _ids and their curresponding offers list
        result[0]?.brands.forEach(brand => {
            output.brands[brand.brand_id] = brand?.offers;
        });



        return output;
    } catch (error) {
      console.error("Error fetching offer data:", error);
      throw error;
    }
  }


module.exports = {getOfferData}
  