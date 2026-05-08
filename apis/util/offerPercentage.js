function getOfferPercentage(productPrice, availableOffers) {
    let maxDiscountPercentage = 0;

    availableOffers.forEach(offer => {
        let discountPercentage = 0;

        if (offer.type === 'percentage') {
            discountPercentage = parseFloat(offer.value); // Percentage value directly from the offer
        } else if (offer.type === 'fixed') {
            const fixedAmount = parseFloat(offer.value); // Fixed amount value from the offer
            discountPercentage = (fixedAmount / productPrice) * 100; // Calculate percentage
        }

        if (discountPercentage > maxDiscountPercentage) {
            maxDiscountPercentage = discountPercentage;
        }
    });

    return {getOfferPercentage};
}
