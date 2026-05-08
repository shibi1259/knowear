const offerService = require("../app/services/offer.service");
const productService = require("../app/services/product.service");

const applyOffersStoreLevel = async () => {
    try {
        // Retrieve the last global offer (offer with type 'complete')
        const offers = await offerService.find({ isDelete: false, isActive: true, offerCategory: "complete" });
        if (!offers?.length) {
            return false;
        }

        // Get the last global offer
        const currentOffer = offers[offers.length - 1];

        //Calculate offer price for each product
        const products = await productService.getAllProduct({});

        for (const product of products) {
            let offerPrice = 0;

            // Apply offer based on offer type
            switch (currentOffer?.type) {
                case 'percentage':
                    offerPrice = product?.price?.offer - (product?.price?.offer * (Number(currentOffer?.value) / 100));
                    break;
                case 'fixed':
                    offerPrice = Math.max(product?.price?.offer - Number(currentOffer?.value), 0);
                    break;
                default:
                    continue;
            }

            if (offerPrice <= 0) { offerPrice = product?.price?.offer; }
            // Update product price with the calculated offer price
            let newProduct = await productService.findByIdAndUpdate(product?._id, { 'price.selling': parseFloat(offerPrice.toFixed(2)), offerExists: true });
        }

        console.log("Store-level offers applied successfully.");
        return true;
    } catch (error) {
        console.error(`Error caught in offer engine store level at ${new Date().toLocaleString()} :: `, error);
    }
};

module.exports = { applyOffersStoreLevel };
